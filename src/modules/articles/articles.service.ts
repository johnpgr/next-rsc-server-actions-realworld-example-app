import { and, desc, eq, sql } from "drizzle-orm"
import slugify from "slugify"
import { decodeTime } from "ulid"
import { z } from "zod"
import { db } from "~/db"
import * as schema from "~/db/schema"
import { createId } from "~/utils/id"
import { Article, ArticleModel } from "./articles.types"
import { NewArticleBody, UpdateArticleBody } from "./articles.validations"

export class ArticlesService {
    private database: typeof db

    private baseArticlesQuery(currentUserId: string | null = null) {
        const favoriteCountSq = this.database
            .select({
                articleId: schema.favorite.article_id,
                favoritesCount: sql`COUNT(*)`.as("favoritesCount"),
            })
            .from(schema.favorite)
            .groupBy(schema.favorite.article_id)
            .as("f")

        return this.database
            .select({
                id: schema.article.id,
                title: schema.article.title,
                description: schema.article.description,
                body: schema.article.body,
                slug: schema.article.slug,
                createdAt: schema.article.id,
                updatedAt: sql<string>`${schema.article.updated_at}`,
                author: {
                    username: schema.user.name,
                    bio: schema.user.bio,
                    image: schema.user.image,
                },
                tagList: sql<string>`GROUP_CONCAT(${schema.tag.name})`,
                favoritesCount:
                    sql<number>`COALESCE(${favoriteCountSq.favoritesCount}, 0)`.as(
                        "favoritesCount",
                    ),
                favorited: sql<number>`CASE WHEN ${schema.favorite.article_id} IS NOT NULL THEN 1 ELSE 0 END`,
            })
            .from(schema.article)
            .innerJoin(
                schema.user,
                eq(schema.article.author_id, schema.user.id),
            )
            .leftJoin(schema.tag, eq(schema.article.id, schema.tag.article_id))
            .leftJoin(
                favoriteCountSq,
                eq(schema.article.id, favoriteCountSq.articleId),
            )
            .leftJoin(
                schema.favorite,
                and(
                    eq(schema.article.id, schema.favorite.article_id),
                    //@ts-ignore
                    eq(schema.favorite.user_id, currentUserId),
                ),
            )
            .groupBy(
                ({ body, title, slug, description, updatedAt, author }) => [
                    title,
                    description,
                    body,
                    slug,
                    updatedAt,
                    author.username,
                    author.bio,
                    author.image,
                ],
            )
    }

    private static readonly articleSchema = z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        body: z.string(),
        slug: z.string(),
        createdAt: z.string().transform((val) => new Date(decodeTime(val))),
        updatedAt: z.string().transform((val) => new Date(val)),
        favoritesCount: z.number(),
        tagList: z
            .string()
            .nullable()
            .transform((val) => val?.split(",")),
        author: z.object({
            username: z.string(),
            bio: z.string().nullable(),
            image: z.string().nullable(),
        }),
        favorited: z.number().transform((val) => val === 1),
    })

    private static readonly articleListSchema = z.array(
        ArticlesService.articleSchema,
    )

    constructor(database: typeof db) {
        this.database = database
    }

    async getAll(
        currentUserId: string | null = null,
        limit: number,
        offset: number,
    ): Promise<Article[]> {
        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .limit(limit)
            .offset(offset)
            .orderBy(
                desc(
                    this.baseArticlesQuery().getSelectedFields().favoritesCount,
                ),
                desc(this.baseArticlesQuery().getSelectedFields().createdAt),
            )
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    /**
     * This method is used to get the feed of articles for the current user.
     * The feed is a list of articles from the users that the current user follows.
     */
    async getFeed(userId: string, limit: number, offset: number) {
        const unparsedArticles = await this.baseArticlesQuery(userId)
            .where(
                sql`${schema.article.author_id} IN (
                    SELECT ${schema.follow.following_id} 
                    FROM ${schema.follow} 
                    WHERE ${schema.follow.follower_id} = ${userId}
                )`,
            )
            .limit(limit)
            .offset(offset)
            .orderBy(
                desc(
                    this.baseArticlesQuery().getSelectedFields().favoritesCount,
                ),
                desc(this.baseArticlesQuery().getSelectedFields().createdAt),
            )
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getAllByAuthor(
        authorName: string,
        currentUserId: string | null = null,
    ) {
        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .where(eq(schema.user.name, authorName))
            .orderBy(
                desc(
                    this.baseArticlesQuery().getSelectedFields().favoritesCount,
                ),
                desc(this.baseArticlesQuery().getSelectedFields().createdAt),
            )
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getAllByTag(
        tag: string,
        currentUserId: string | null = null,
        limit: number,
        offset: number,
    ): Promise<Article[]> {
        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .where(
                // This is currently bugged in drizzle-orm with sqlite
                // exists(
                //     this.database
                //         .select({
                //             exists: sql`1`,
                //         })
                //         .from(schema.tag)
                //         .where(
                //             and(
                //                 eq(schema.tag.article_id, schema.article.id),
                //                 eq(schema.tag.name, tag),
                //             ),
                //         ),
                // ),
                sql`EXISTS(
                    SELECT 1
                    FROM ${schema.tag}
                    WHERE ${schema.tag.article_id} = ${schema.article.id}
                    AND ${schema.tag.name} = ${tag}
                )`,
            )
            .limit(limit)
            .offset(offset)
            .orderBy(
                desc(
                    this.baseArticlesQuery().getSelectedFields().favoritesCount,
                ),
                desc(this.baseArticlesQuery().getSelectedFields().createdAt),
            )
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getAllFavoritedByUser(
        userId: string,
        currentUserId: string | null = null,
        limit: number,
        offset: number,
    ) {
        // This is currently bugged in drizzle-orm with sqlite
        // const favoritedBySQ = this.database
        //     .select()
        //     .from(schema.favorite)
        //     .where(
        //         and(
        //             eq(schema.favorite.article_id, schema.article.id),
        //             eq(schema.favorite.user_id, userId),
        //         ),
        //     )

        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .where(
                // exists(favoritedBySQ)
                sql`
                    EXISTS (
                        SELECT 1
                        FROM ${schema.favorite}
                        WHERE ${schema.favorite.article_id} = ${schema.article.id}
                        AND ${schema.favorite.user_id} = ${userId}
                    )
                `,
            )
            .limit(limit)
            .offset(offset)
            .orderBy(
                desc(
                    this.baseArticlesQuery().getSelectedFields().favoritesCount,
                ),
                desc(this.baseArticlesQuery().getSelectedFields().createdAt),
            )
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getById(
        id: string,
        currentUserId: string | null = null,
    ): Promise<Article | null> {
        const article = await this.baseArticlesQuery(currentUserId)
            .where(eq(schema.article.id, id))
            .get()

        if (!article) {
            return null
        }

        return ArticlesService.articleSchema.parse(article)
    }

    async getBySlug(
        slug: string,
        userId: string | null = null,
    ): Promise<Article | null> {
        const article = await this.baseArticlesQuery(userId)
            .where(eq(schema.article.slug, slug))
            .get()

        if (!article) {
            return null
        }

        return ArticlesService.articleSchema.parse(article)
    }

    /**
     *
     * @throws {Error}
     */
    async create(
        data: NewArticleBody,
        userId: string,
    ): Promise<ArticleModel | null> {
        const { title, description, body, tagList } = data.article
        const slug = slugify(title, { lower: true })

        const existingArticleWithSameSlug = await this.getBySlug(slug)

        if (existingArticleWithSameSlug)
            throw new Error("Article with same slug already exists")

        const article = await this.database
            .insert(schema.article)
            .values({
                id: createId(),
                title,
                description,
                body,
                slug,
                author_id: userId,
            })
            .returning()
            .get()

        const insertTagsPromises = []

        if (tagList) {
            for (const tag of tagList) {
                insertTagsPromises.push(
                    this.database
                        .insert(schema.tag)
                        .values({
                            id: createId(),
                            name: tag,
                            article_id: article.id,
                        })
                        .run(),
                )
            }
        }

        await Promise.all(insertTagsPromises)

        return article
    }

    /**
     *
     * @param data - The article data to update
     * @param slug - The slug of the article to update
     * @param userId - The id of the user updating the article
     * @throws {Error}
     */
    async update(data: UpdateArticleBody): Promise<ArticleModel> {
        const { slug } = data
        const { title, description, body: articleBody, tagList } = data.article

        const _article = await this.database.query.article.findFirst({
            where: eq(schema.article.slug, slug),
            columns: { id: true },
        })

        if (!_article) throw new Error("Article not found with slug: " + slug)

        const newSlug = title ? slugify(title) : undefined

        const insertTagsPromises = []
        const removeTagsPromises = []

        const existingTags = new Set(
            await this.database.query.tag
                .findMany({
                    where: eq(schema.tag.article_id, _article.id),
                    columns: { name: true },
                })
                .then((tags) => tags.map((tag) => tag.name)),
        )

        // Insert new tags that are not in the old tag list
        if (tagList) {
            for (const tag of tagList) {
                if (!existingTags.has(tag)) {
                    insertTagsPromises.push(
                        this.database
                            .insert(schema.tag)
                            .values({
                                id: createId(),
                                name: tag,
                                article_id: _article.id,
                            })
                            .run(),
                    )
                }
            }

            const newTags = new Set(tagList)

            //Remove tags that are not in the new tag list
            for (const tag of existingTags) {
                if (!newTags.has(tag)) {
                    removeTagsPromises.push(
                        this.database
                            .delete(schema.tag)
                            .where(
                                and(
                                    eq(schema.tag.name, tag),
                                    eq(schema.tag.article_id, _article.id),
                                ),
                            )
                            .run(),
                    )
                }
            }
        }

        //Update article
        const article = await this.database
            .update(schema.article)
            .set({
                title,
                description,
                body: articleBody,
                slug: newSlug,
            })
            .where(eq(schema.article.id, _article.id))
            .returning()
            .get()

        //Insert new tags and remove old tags
        await Promise.all(insertTagsPromises.concat(removeTagsPromises))

        return article
    }

    async isAuthor(userId: string, slug: string): Promise<boolean> {
        const found = await this.database.query.article.findFirst({
            where: eq(schema.article.slug, slug),
        })

        if (!found) return false

        return found.author_id === userId
    }

    async delete(slug: string): Promise<ArticleModel | undefined> {
        const article = await this.database
            .delete(schema.article)
            .where(eq(schema.article.slug, slug))
            .returning()
            .get()

        return article
    }
}

export const articlesService = new ArticlesService(db)
