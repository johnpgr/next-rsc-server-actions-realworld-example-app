import slugify from 'slugify'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db/drizzle-db'
import { and, desc, eq, exists, isNull, notInArray, or, sql } from 'drizzle-orm'
import {
    article,
    favorite,
    follow,
    tag,
    tag as tagTable,
    user,
} from '~/db/schema'
import { createId, getDateFromULID } from '~/lib/utils'
import { NewArticleBody, UpdateArticleBody } from '~/app/article/validations'

export type GetArticlesParams = {
    tag: string | null
    authorName: string | null
    favoritedBy: string | null
    limit: number
    offset: number
}

export type ParsedArticleQueryResponse = {
    title: string
    description: string
    body: string
    slug: string
    createdAt: string
    updatedAt: string
    author: {
        username: string
        bio: string
        image: string
    }
    tagList: string[]
    favoritesCount: number
    favorited: boolean
}

class ArticlesService {
    private db: PlanetScaleDatabase

    constructor(db: PlanetScaleDatabase) {
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
                title: article.title,
                description: article.description,
                body: article.body,
                slug: article.slug,
                createdAt: article.id,
                updatedAt: article.updated_at,
                author: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                },
                tagList: sql`GROUP_CONCAT(${tagTable.name} SEPARATOR ',')`,
                favoritesCount: sql`COALESCE(f.favoritesCount, 0)`,
                favorited: sql`IF(${favorite.article_id} IS NOT NULL, 1, 0)`,
            })
            .from(article)
            .innerJoin(user, eq(article.author_id, user.id))
            .leftJoin(tagTable, eq(article.id, tagTable.article_id))
            .leftJoin(
                sql`
                    (SELECT ${favorite.article_id}, COUNT(*) AS favoritesCount
                    FROM ${favorite}
                    GROUP BY ${favorite.article_id}) 
                    AS f
                `,
                eq(article.id, sql`f.article_id`),
            )
            .leftJoin(
                favorite,
                and(
                    eq(article.id, favorite.article_id),
                    eq(favorite.user_id, sql`${currentUserId}`),
                ),
            )
            .where(
                and(
                    and(
                        or(
                            isNull(sql`${authorName}`),
                            eq(user.username, sql`${authorName}`),
                        ),
                        or(
                            isNull(sql`${favoritedBy}`),
                            exists(sql`(
                                SELECT 1
                                FROM ${favorite}
                                JOIN ${user}
                                ON ${favorite.user_id} = ${user.id}
                                WHERE ${article.id} = ${favorite.article_id}
                                AND ${user.username} = ${favoritedBy}
                            )`),
                        ),
                    ),
                    and(
                        or(isNull(sql`${tag}`), eq(tagTable.name, sql`${tag}`)),
                        or(
                            //@ts-ignore
                            eq(sql`${feedType}`, sql`'global'`),
                            and(
                                //@ts-ignore
                                eq(sql`${feedType}`, sql`'user'`),
                                exists(sql`(
                                    SELECT 1
                                    FROM ${follow}
                                    WHERE ${follow.follower_id} = ${currentUserId}
                                    AND ${follow.following_id} = ${article.author_id}
                                )`),
                            ),
                        ),
                    ),
                ),
            )
            .groupBy(article.id)
            .orderBy(desc(article.id))
            .limit(limit)
            .offset(offset)

        //parse the response
        for (let article of articles) {
            article.createdAt = getDateFromULID(article.createdAt).toISOString()
            article.tagList = article.tagList && (article.tagList as string).split(',')
            article.favorited = article.favorited === 1
            article.favoritesCount = parseInt(article.favoritesCount as string)
        }

        return articles as unknown as ParsedArticleQueryResponse[]
    }

    async getArticleBySlug(
        slug: string,
        userId: string | null,
    ): Promise<ParsedArticleQueryResponse | null> {
        const [found] = await this.db
            .select({
                title: article.title,
                description: article.description,
                body: article.body,
                slug: article.slug,
                createdAt: article.id,
                updatedAt: article.updated_at,
                author: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                },
                tagList: sql`(
                    SELECT GROUP_CONCAT(t.name SEPARATOR ',')
                    FROM tag t
                    WHERE t.article_id = ${article.id})
                `,
                favoritesCount: sql`COALESCE(favorites.favoritesCount, 0)`,
                favorited: sql`IF(${favorite.user_id} IS NOT NULL, 1, 0)`,
            })
            .from(article)
            .innerJoin(user, eq(article.author_id, user.id))
            .leftJoin(
                sql`(
                SELECT article_id, COUNT(*) AS favoritesCount
                FROM favorite
                GROUP BY article_id
            ) AS favorites`,
                eq(article.id, sql`favorites.article_id`),
            )
            .leftJoin(
                favorite,
                and(
                    eq(article.id, favorite.article_id),
                    eq(favorite.user_id, sql`${userId}`),
                ),
            )
            .where(eq(article.slug, slug))

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
    async createArticle(input: {
        body: NewArticleBody
        userId: string
    }): Promise<ParsedArticleQueryResponse | null> {
        const {
            title,
            description,
            body: articleBody,
            tagList,
        } = input.body.article
        let slug = slugify(title)

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
                    this.db.insert(tag).values({
                        id: createId(),
                        name: _tag,
                        article_id: articleId,
                    }),
                )
            }
        }

        const { rowsAffected } = await this.db.insert(article).values({
            id: articleId,
            title,
            description,
            body: articleBody,
            slug,
            author_id: input.userId,
        })

        if (rowsAffected === 0) {
            throw new Error('Failed to create article')
        }

        await Promise.all(insertTagsPromises)

        return this.getArticleBySlug(slug, input.userId)
    }

    /**
     *
     * @throws {Error}
     */
    async updateArticle(args: {
        userId: string
        slug: string
        body: UpdateArticleBody
    }): Promise<ParsedArticleQueryResponse> {
        const {
            title,
            description,
            body: articleBody,
            tagList,
        } = args.body.article

        const [{ id }] = await this.db
            .select({ id: article.id })
            .from(article)
            .where(eq(article.slug, args.slug))

        const slug = title ? slugify(title) : undefined
        const insertTagsPromises = []

        const existingTags = await this.db
            .select({ tagName: tag.name })
            .from(tag)
            .where(eq(tag.article_id, id))

        // Insert new tags that are not in the old tag list
        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                if (!existingTags.find((tag) => tag.tagName === _tag)) {
                    insertTagsPromises.push(
                        this.db.insert(tag).values({
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
                    await this.db.delete(tag).where(eq(tag.name, _tag.tagName))
                }
            }
        }

        //Update article
        const { rowsAffected } = await this.db
            .update(article)
            .set({
                title,
                description,
                body: articleBody,
                slug,
            })
            .where(eq(article.id, id))

        if (rowsAffected === 0) {
            throw new Error('Failed to update article')
        }

        //Insert new tags
        await Promise.all(insertTagsPromises)

        if (!slug) {
            const [{ slug }] = await this.db
                .select({ slug: article.slug })
                .from(article)
                .where(eq(article.id, id))
                .limit(1)

            return this.getArticleBySlug(
                slug,
                args.userId,
            ) as Promise<ParsedArticleQueryResponse>
        }

        return this.getArticleBySlug(
            slug,
            args.userId,
        ) as Promise<ParsedArticleQueryResponse>
    }

    async isArticleAuthor(userId: string, slug: string): Promise<boolean> {
        const [found] = await this.db
            .select({ authorId: article.author_id })
            .from(article)
            .where(eq(article.slug, slug))
            .limit(1)

        return found.authorId === userId
    }

    async getArticleIdBySlug(slug: string): Promise<string | null> {
        const [found] = await this.db
            .select({ id: article.id })
            .from(article)
            .where(eq(article.slug, slug))
            .limit(1)

        return found?.id ?? null
    }

    async deleteArticle(slug: string): Promise<boolean> {
        const { rowsAffected } = await this.db
            .delete(article)
            .where(eq(article.slug, slug))
        return rowsAffected > 0
    }
}

export const articlesService = new ArticlesService(db)
