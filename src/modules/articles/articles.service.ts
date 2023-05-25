import slugify from "slugify"
import { db } from "~/db"
import { and, desc, eq, exists, isNull, or, sql } from "drizzle-orm"
import * as schema from "~/db/schema"
import { Article, GetArticlesParams, ArticleModel } from "./articles.types"
import { NewArticleBody, UpdateArticleBody } from "./articles.validations"

class ArticlesService {
    private database: typeof db

    constructor(database: typeof db) {
        this.database = database
    }

    async getArticles(args: {
        params: GetArticlesParams
        currentUserId: string | null
        feedType: "global" | "user"
    }): Promise<Article[]> {
        const { feedType, currentUserId } = args
        const { tag, authorName, favoritedBy, limit, offset } = args.params

        // const articles = await this.database
        //     .select({
        //         title: schema.article.title,
        //         description: schema.article.description,
        //         body: schema.article.body,
        //         slug: schema.article.slug,
        //         createdAt: schema.article.created_at,
        //         updatedAt: schema.article.updated_at,
        //         author: {
        //             username: schema.user.name,
        //             bio: schema.user.bio,
        //             image: schema.user.image,
        //         },
        //         tagList: sql`string_agg(${schema.tag.name} ',')`,
        //         favoritesCount: sql`COALESCE(f.favoritesCount, 0)`,
        //         favorited: sql`IF(${schema.favorite.article_id} IS NOT NULL, 1, 0)`,
        //     })
        //     .from(schema.article)
        //     .innerJoin(
        //         schema.user,
        //         eq(schema.article.author_id, schema.user.id),
        //     )
        //     .leftJoin(schema.tag, eq(schema.article.id, schema.tag.article_id))
        //     .leftJoin(
        //         sql`
        //             (SELECT ${schema.favorite.article_id}, COUNT(*) AS favoritesCount
        //             FROM ${schema.favorite}
        //             GROUP BY ${schema.favorite.article_id})
        //             AS f
        //         `,
        //         eq(schema.article.id, sql`f.article_id`),
        //     )
        //     .leftJoin(
        //         schema.favorite,
        //         and(
        //             eq(schema.article.id, schema.favorite.article_id),
        //             eq(schema.favorite.user_id, sql`${currentUserId}`),
        //         ),
        //     )
        //     .where(
        //         and(
        //             and(
        //                 or(
        //                     isNull(sql`${authorName}`),
        //                     eq(schema.user.name, sql`${authorName}`),
        //                 ),
        //                 or(
        //                     isNull(sql`${favoritedBy}`),
        //                     exists(sql`(
        //                         SELECT 1
        //                         FROM ${schema.favorite}
        //                         JOIN ${schema.user}
        //                         ON ${schema.favorite.user_id} = ${schema.user.id}
        //                         WHERE ${schema.article.id} = ${schema.favorite.article_id}
        //                         AND ${schema.user.name} = ${favoritedBy}
        //                     )`),
        //                 ),
        //             ),
        //             and(
        //                 or(
        //                     isNull(sql`${tag}`),
        //                     eq(schema.tag.name, sql`${tag}`),
        //                 ),
        //                 or(
        //                     //@ts-ignore
        //                     eq(sql`${feedType}`, sql`'global'`),
        //                     and(
        //                         //@ts-ignore
        //                         eq(sql`${feedType}`, sql`'user'`),
        //                         exists(sql`(
        //                             SELECT 1
        //                             FROM ${schema.follow}
        //                             WHERE ${schema.follow.follower_id} = ${currentUserId}
        //                             AND ${schema.follow.following_id} = ${schema.article.author_id}
        //                         )`),
        //                     ),
        //                 ),
        //             ),
        //         ),
        //     )
        //     .groupBy(schema.article.id)
        //     .orderBy(desc(schema.article.id))
        //     .limit(limit)
        //     .offset(offset)
        //
        const articles = await this.database.execute(sql`
            SELECT
                article.title,
                article.description,
                article.body,
                article.slug,
                article.id,
                article.updated_at,
                "user".name,
                "user".bio,
                "user".image,
                STRING_AGG(tag.name, ',') AS tagList,
                COALESCE(f.favoritesCount, 0) AS favoritesCount,
                CASE WHEN fav.article_id IS NOT NULL THEN 1 ELSE 0 END AS favorited
            FROM
                article
                JOIN "user" ON article.author_id = "user".id
                LEFT JOIN tag ON article.id = tag.article_id
                LEFT JOIN (
                    SELECT
                        favorite.article_id,
                        COUNT(*) AS favoritesCount
                    FROM
                        favorite
                    GROUP BY
                        favorite.article_id
                ) AS f ON article.id = f.article_id
                LEFT JOIN favorite AS fav ON (article.id = fav.article_id AND fav.user_id = ${currentUserId})
            WHERE
                ((${authorName} IS NULL OR "user".name = ${authorName})
                AND (${favoritedBy} IS NULL OR EXISTS (
                    SELECT 1
                    FROM favorite
                    JOIN "user" ON favorite.user_id = "user".id
                    WHERE article.id = favorite.article_id
                    AND "user".name = ${favoritedBy}
                )))
                AND ((${tag} IS NULL OR tag.name = ${tag})
                AND (${feedType} = 'global' OR (${feedType} = 'user' AND EXISTS (
                    SELECT 1
                    FROM follow
                    WHERE follow.follower_id = ${currentUserId}
                    AND follow.following_id = article.author_id
                ))))
            GROUP BY
                article.title,
                article.description,
                article.body,
                article.slug,
                article.id,
                article.updated_at,
                "user".name,
                "user".bio,
                "user".image,
                f.favoritesCount,
                fav.article_id
            ORDER BY
                article.id DESC
            LIMIT
                ${limit}
            OFFSET
                ${offset};
        `)

        console.log(articles.rows)
        // //parse the response
        // for (let article of articles) {
        //     article.tagList =
        //         article.tagList && (article.tagList as string).split(",")
        //     article.favorited = article.favorited === 1
        //     article.favoritesCount = parseInt(article.favoritesCount as string)
        // }

        // return articles as unknown as Article[]
    }

    async getArticleById(
        id: string,
        userId: string | null = null,
    ): Promise<Article | null> {
        const [found] = await this.database
            .select({
                title: schema.article.title,
                description: schema.article.description,
                body: schema.article.body,
                slug: schema.article.slug,
                createdAt: schema.article.created_at,
                updatedAt: schema.article.updated_at,
                author: {
                    username: schema.user.name,
                    bio: schema.user.bio,
                    image: schema.user.image,
                },
                tagList: sql`(
                    SELECT string_agg(t.name ',')
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
            .where(eq(schema.article.id, id))

        if (!found) {
            return null
        }

        //parse the response
        found.tagList = found.tagList && (found.tagList as string).split(",")
        found.favorited = found.favorited === "1"
        found.favoritesCount = parseInt(found.favoritesCount as string)

        return found as unknown as Article
    }

    async getArticleBySlug(
        slug: string,
        userId: string | null = null,
    ): Promise<Article | null> {
        const [found] = await this.database
            .select({
                title: schema.article.title,
                description: schema.article.description,
                body: schema.article.body,
                slug: schema.article.slug,
                createdAt: schema.article.created_at,
                updatedAt: schema.article.updated_at,
                author: {
                    username: schema.user.name,
                    bio: schema.user.bio,
                    image: schema.user.image,
                },
                tagList: sql`(
                    SELECT string_agg(t.name ',')
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
        found.tagList = found.tagList && (found.tagList as string).split(",")
        found.favorited = found.favorited === "1"
        found.favoritesCount = parseInt(found.favoritesCount as string)

        return found as unknown as Article
    }

    /**
     *
     * @throws {Error}
     */
    async createArticle(
        data: NewArticleBody,
        userId: string,
    ): Promise<ArticleModel | null> {
        const { title, description, body: articleBody, tagList } = data.article

        let slug = slugify(title, { lower: true })

        const existingArticleWithSameSlug = await this.getArticleBySlug(
            slug,
            null,
        )

        if (existingArticleWithSameSlug)
            throw new Error("Article with same slug already exists")

        const [article] = await this.database
            .insert(schema.article)
            .values({
                title,
                description,
                body: articleBody,
                slug,
                author_id: userId,
            })
            .returning()

        const insertTagsPromises = []

        if (tagList && tagList.length > 0) {
            for (const _tag of tagList) {
                insertTagsPromises.push(
                    this.database.insert(schema.tag).values({
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
    async updateArticle(data: UpdateArticleBody): Promise<ArticleModel> {
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
                }
            }
        }

        //Update article
        const [article] = await this.database
            .update(schema.article)
            .set({
                title,
                description,
                body: articleBody,
                slug: newSlug,
            })
            .where(eq(schema.article.id, _article.id))
            .returning()

        //Insert new tags
        await Promise.all(insertTagsPromises)

        return article
    }

    async isArticleAuthor(userId: string, slug: string): Promise<boolean> {
        const found = await this.database.query.article.findFirst({
            where: eq(schema.article.slug, slug),
        })

        if (!found) return false

        return found.author_id === userId
    }

    async getArticleIdBySlug(slug: string): Promise<string | null> {
        const found = await this.database.query.article.findFirst({
            where: eq(schema.article.slug, slug),
            columns: { id: true },
        })

        return found?.id ?? null
    }

    async deleteArticle(slug: string): Promise<ArticleModel> {
        const [article] = await this.database
            .delete(schema.article)
            .where(eq(schema.article.slug, slug))
            .returning()

        return article
    }
}

export const articlesService = new ArticlesService(db)
