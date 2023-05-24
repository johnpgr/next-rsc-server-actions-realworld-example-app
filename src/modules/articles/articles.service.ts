import slugify from 'slugify'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db'
import { and, desc, eq, exists, isNull, or, sql } from 'drizzle-orm'
import { schema } from '~/db/schema'
import { createId, getDateFromULID } from '~/utils/ulid'
import {
    ParsedArticleQueryResponse,
    GetArticlesParams,
} from './articles.types'
import { NewArticleBody, UpdateArticleBody } from './articles.validations'

class ArticlesService {
    private db: PlanetScaleDatabase<typeof schema>

    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    async getArticles(args: {
        params: GetArticlesParams
        currentUserId: string | null
        feedType: 'global' | 'user'
    }): Promise<ParsedArticleQueryResponse[]> {
        const { feedType, currentUserId } = args
        const { tag, authorName, favoritedBy, limit, offset } = args.params

        const articles = await this.db
            .select({
                title: schema.article.title,
                description: schema.article.description,
                body: schema.article.body,
                slug: schema.article.slug,
                createdAt: schema.article.id,
                updatedAt: schema.article.updated_at,
                author: {
                    username: schema.user.username,
                    bio: schema.user.bio,
                    image: schema.user.image,
                },
                tagList: sql`GROUP_CONCAT(${schema.tag.name} SEPARATOR ',')`,
                favoritesCount: sql`COALESCE(f.favoritesCount, 0)`,
                favorited: sql`IF(${schema.favorite.article_id} IS NOT NULL, 1, 0)`,
            })
            .from(schema.article)
            .innerJoin(
                schema.user,
                eq(schema.article.author_id, schema.user.id),
            )
            .leftJoin(schema.tag, eq(schema.article.id, schema.tag.article_id))
            .leftJoin(
                sql`
                    (SELECT ${schema.favorite.article_id}, COUNT(*) AS favoritesCount
                    FROM ${schema.favorite}
                    GROUP BY ${schema.favorite.article_id}) 
                    AS f
                `,
                eq(schema.article.id, sql`f.article_id`),
            )
            .leftJoin(
                schema.favorite,
                and(
                    eq(schema.article.id, schema.favorite.article_id),
                    eq(schema.favorite.user_id, sql`${currentUserId}`),
                ),
            )
            .where(
                and(
                    and(
                        or(
                            isNull(sql`${authorName}`),
                            eq(schema.user.username, sql`${authorName}`),
                        ),
                        or(
                            isNull(sql`${favoritedBy}`),
                            exists(sql`(
                                SELECT 1
                                FROM ${schema.favorite}
                                JOIN ${schema.user}
                                ON ${schema.favorite.user_id} = ${schema.user.id}
                                WHERE ${schema.article.id} = ${schema.favorite.article_id}
                                AND ${schema.user.username} = ${favoritedBy}
                            )`),
                        ),
                    ),
                    and(
                        or(
                            isNull(sql`${tag}`),
                            eq(schema.tag.name, sql`${tag}`),
                        ),
                        or(
                            //@ts-ignore
                            eq(sql`${feedType}`, sql`'global'`),
                            and(
                                //@ts-ignore
                                eq(sql`${feedType}`, sql`'user'`),
                                exists(sql`(
                                    SELECT 1
                                    FROM ${schema.follow}
                                    WHERE ${schema.follow.follower_id} = ${currentUserId}
                                    AND ${schema.follow.following_id} = ${schema.article.author_id}
                                )`),
                            ),
                        ),
                    ),
                ),
            )
            .groupBy(schema.article.id)
            .orderBy(desc(schema.article.id))
            .limit(limit)
            .offset(offset)

        //parse the response
        for (let article of articles) {
            article.createdAt = getDateFromULID(article.createdAt).toISOString()
            article.tagList =
                article.tagList && (article.tagList as string).split(',')
            article.favorited = article.favorited === 1
            article.favoritesCount = parseInt(article.favoritesCount as string)
        }

        return articles as unknown as ParsedArticleQueryResponse[]
    }

    async getArticleBySlug(
        slug: string,
        userId: string | null = null,
    ): Promise<ParsedArticleQueryResponse | null> {
        const [found] = await this.db
            .select({
                title: schema.article.title,
                description: schema.article.description,
                body: schema.article.body,
                slug: schema.article.slug,
                createdAt: schema.article.id,
                updatedAt: schema.article.updated_at,
                author: {
                    username: schema.user.username,
                    bio: schema.user.bio,
                    image: schema.user.image,
                },
                tagList: sql`(
                    SELECT GROUP_CONCAT(t.name SEPARATOR ',')
                    FROM tag t
                    WHERE t.article_id = ${schema.article.id})
                `,
                favoritesCount: sql`COALESCE(favorites.favoritesCount, 0)`,
                favorited: sql`IF(${schema.favorite.user_id} IS NOT NULL, 1, 0)`,
            })
            .from(schema.article)
            .innerJoin(
                schema.user,
                eq(schema.article.author_id, schema.user.id),
            )
            .leftJoin(
                sql`(
                SELECT article_id, COUNT(*) AS favoritesCount
                FROM favorite
                GROUP BY article_id
            ) AS favorites`,
                eq(schema.article.id, sql`favorites.article_id`),
            )
            .leftJoin(
                schema.favorite,
                and(
                    eq(schema.article.id, schema.favorite.article_id),
                    eq(schema.favorite.user_id, sql`${userId}`),
                ),
            )
            .where(eq(schema.article.slug, slug))

        if (!found) {
            return null
        }

        //parse the response
        found.createdAt = getDateFromULID(found.createdAt).toISOString()
        found.tagList = found.tagList && (found.tagList as string).split(',')
        found.favorited = found.favorited === '1'
        found.favoritesCount = parseInt(found.favoritesCount as string)

        return found as unknown as ParsedArticleQueryResponse
    }

    /**
     *
     * @throws {Error}
     */
    async createArticle(
        data: NewArticleBody,
        userId: string,
    ): Promise<ParsedArticleQueryResponse | null> {
        const { title, description, body: articleBody, tagList } = data.article

        let slug = slugify(title, { lower: true })

        const existingArticleWithSameSlug = await this.getArticleBySlug(
            slug,
            null,
        )

        if (existingArticleWithSameSlug) {
            return null
        }

        const articleId = createId()
        const insertTagsPromises = []

        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                insertTagsPromises.push(
                    this.db.insert(schema.tag).values({
                        id: createId(),
                        name: _tag,
                        article_id: articleId,
                    }),
                )
            }
        }

        const { rowsAffected } = await this.db.insert(schema.article).values({
            id: articleId,
            title,
            description,
            body: articleBody,
            slug,
            author_id: userId,
        })

        if (rowsAffected === 0) {
            throw new Error('Failed to create article')
        }

        await Promise.all(insertTagsPromises)

        return this.getArticleBySlug(slug, userId)
    }

    /**
     *
     * @param data - The article data to update
     * @param slug - The slug of the article to update
     * @param userId - The id of the user updating the article
     * @throws {Error}
     */
    async updateArticle(
        data: UpdateArticleBody,
        userId: string,
    ): Promise<ParsedArticleQueryResponse> {
        const { slug } = data
        const { title, description, body: articleBody, tagList } = data.article

        const [{ id }] = await this.db
            .select({ id: schema.article.id })
            .from(schema.article)
            .where(eq(schema.article.slug, slug))

        const newSlug = title ? slugify(title) : undefined
        const insertTagsPromises = []

        const existingTags = await this.db
            .select({ tagName: schema.tag.name })
            .from(schema.tag)
            .where(eq(schema.tag.article_id, id))

        // Insert new tags that are not in the old tag list
        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                if (!existingTags.find((tag) => tag.tagName === _tag)) {
                    insertTagsPromises.push(
                        this.db.insert(schema.tag).values({
                            id: createId(),
                            name: _tag,
                            article_id: id,
                        }),
                    )
                }
            }
            //Remove tags that are not in the new tag list
            for (const _tag of existingTags) {
                if (!tagList.find((tag) => tag === _tag.tagName)) {
                    await this.db
                        .delete(schema.tag)
                        .where(eq(schema.tag.name, _tag.tagName))
                }
            }
        }

        //Update article
        const { rowsAffected } = await this.db
            .update(schema.article)
            .set({
                title,
                description,
                body: articleBody,
                slug,
            })
            .where(eq(schema.article.id, id))

        if (rowsAffected === 0) {
            throw new Error('Failed to update article')
        }

        //Insert new tags
        await Promise.all(insertTagsPromises)

        if (!slug) {
            const [{ slug }] = await this.db
                .select({ slug: schema.article.slug })
                .from(schema.article)
                .where(eq(schema.article.id, id))
                .limit(1)

            return this.getArticleBySlug(
                slug,
                userId,
            ) as Promise<ParsedArticleQueryResponse>
        }

        return this.getArticleBySlug(
            slug,
            userId,
        ) as Promise<ParsedArticleQueryResponse>
    }

    async isArticleAuthor(userId: string, slug: string): Promise<boolean> {
        const [found] = await this.db
            .select({ authorId: schema.article.author_id })
            .from(schema.article)
            .where(eq(schema.article.slug, slug))
            .limit(1)

        if (!found) return false

        return found.authorId === userId
    }

    async getArticleIdBySlug(slug: string): Promise<string | null> {
        const [found] = await this.db
            .select({ id: schema.article.id })
            .from(schema.article)
            .where(eq(schema.article.slug, slug))
            .limit(1)

        return found?.id ?? null
    }

    async deleteArticle(slug: string): Promise<boolean> {
        const { rowsAffected } = await this.db
            .delete(schema.article)
            .where(eq(schema.article.slug, slug))
        return rowsAffected > 0
    }
}

export const articlesService = new ArticlesService(db)
