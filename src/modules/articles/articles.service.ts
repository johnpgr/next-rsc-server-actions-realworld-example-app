import slugify from "slugify"
import { db } from "~/db"
import { and, desc, eq, exists, isNull, or, sql } from "drizzle-orm"
import * as schema from "~/db/schema"
import { Article, ArticleModel } from "./articles.types"
import { NewArticleBody, UpdateArticleBody } from "./articles.validations"
import { decodeTime } from "ulid"
import { createId } from "~/utils/id"
import { z } from "zod"

class ArticlesService {
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
                favoritesCount: sql<number>`COALESCE(${favoriteCountSq.favoritesCount}, 0)`,
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
                    eq(schema.favorite.user_id, sql`${currentUserId}`),
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
            .optional()
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
            .orderBy(desc(schema.article.id))
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    /**
     * This method is used to get the feed of articles for the current user.
     * The feed is a list of articles from the users that the current user follows.
     */
    async getFeed(userId: string, limit: number, offset: number) {
        const unparsedArticles = await this.baseArticlesQuery(userId)
            .innerJoin(schema.follow, eq(schema.follow.follower_id, userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.article.id))
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getAllByAuthor(
        authorName: string,
        currentUserId: string | null = null,
    ) {
        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .where(eq(schema.user.name, authorName))
            .orderBy(desc(schema.article.id))
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
                exists(
                    this.database
                        .select({
                            exists: sql`1`,
                        })
                        .from(schema.tag)
                        .where(
                            and(
                                eq(schema.tag.article_id, schema.article.id),
                                eq(schema.tag.name, tag),
                            ),
                        ),
                ),
            )
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.article.id))
            .all()

        return ArticlesService.articleListSchema.parse(unparsedArticles)
    }

    async getAllFavoritedByUser(
        userId: string,
        currentUserId: string | null = null,
        limit: number,
        offset: number,
    ) {
        const unparsedArticles = await this.baseArticlesQuery(currentUserId)
            .innerJoin(schema.favorite, eq(schema.favorite.user_id, userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.article.id))
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
        const { title, description, body: articleBody, tagList } = data.article

        let slug = slugify(title, { lower: true })

        const existingArticleWithSameSlug = await this.getBySlug(slug, null)

        if (existingArticleWithSameSlug)
            throw new Error("Article with same slug already exists")

        const article = await this.database
            .insert(schema.article)
            .values({
                id: createId(),
                title,
                description,
                body: articleBody,
                slug,
                author_id: userId,
            })
            .returning()
            .get()

        const insertTagsPromises = []

        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                insertTagsPromises.push(
                    this.database.insert(schema.tag).values({
                        id: createId(),
                        name: _tag,
                        article_id: article.id,
                    }),
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

        const existingTags = await this.database.query.tag.findMany({
            where: eq(schema.tag.article_id, _article.id),
            columns: { name: true },
        })

        // Insert new tags that are not in the old tag list
        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                if (!existingTags.find((tag) => tag.name === _tag)) {
                    insertTagsPromises.push(
                        this.database.insert(schema.tag).values({
                            id: createId(),
                            name: _tag,
                            article_id: _article.id,
                        }),
                    )
                }
            }

            //Remove tags that are not in the new tag list
            for (const _tag of existingTags) {
                if (!tagList.find((tag) => tag === _tag.name)) {
                    await this.database
                        .delete(schema.tag)
                        .where(eq(schema.tag.name, _tag.name))
                        .run()
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

        //Insert new tags
        await Promise.all(insertTagsPromises)

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
