import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { db } from "~/db/drizzle-db"
import { and, desc, eq, exists, isNull, or, sql } from "drizzle-orm"
import { article, favorite, follow, tag as tagTable, user } from "~/db/schema"
import { getDateFromULID } from "~/lib/utils"

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

    async getArticles(
        params: GetArticlesParams,
        currentUserId: string | null,
        feedType: "global" | "user" = "global",
    ):Promise<ParsedArticleQueryResponse[]> {
        const { tag, authorName, favoritedBy, limit, offset } = params
        /**
            SELECT
                a.title,
                a.description,
                a.body,
                a.slug,
                a.id as createdAt,
                a.updated_at as updatedAt,
                u.name AS authorName,
                u.bio AS authorBio,
                u.image AS authorImage,
                GROUP_CONCAT(t.name SEPARATOR ',') AS tagList,
                COALESCE(f.favoritesCount, 0) AS favoritesCount,
                IF(fav.article_id IS NOT NULL, 1, 0) AS favorited
            FROM
                article a
                JOIN user u ON a.author_id = u.id
                LEFT JOIN tag t ON t.article_id = a.id
                LEFT JOIN (
                    SELECT article_id, COUNT(*) AS favoritesCount
                    FROM favorite
                    GROUP BY article_id
                ) AS f ON a.id = f.article_id
                LEFT JOIN favorite fav ON a.id = fav.article_id AND fav.user_id = ${currentUserId}
            WHERE
                (${authorName} IS NULL OR u.name = ${authorName})
                AND (${favoritedBy} IS NULL OR EXISTS (
                    SELECT 1
                    FROM favorite f
                    JOIN user uf ON f.user_id = uf.id
                    WHERE a.id = f.article_id AND uf.name = ${favoritedBy}
                ))
                AND (${tag} IS NULL OR t.name = ${tag})
                AND (
                    ${feedType} = 'global' OR
                    (
                        ${feedType} = 'user' AND EXISTS (
                            SELECT 1
                            FROM follow fw
                            WHERE fw.follower_id = ${currentUserId} AND fw.following_id = a.author_id
                        )
                    )
                )
            GROUP BY
                a.id
            ORDER BY
                a.id DESC
            LIMIT
                ${limit} OFFSET ${offset}; 
         */
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
            article.tagList = (article.tagList as string).split(",")
            article.favorited = article.favorited === 1
            article.favoritesCount = parseInt(article.favoritesCount as string)
        }

        return articles as unknown as ParsedArticleQueryResponse[]
    }

    async getArticleBySlug(
        slug: string,
        userId: string,
    ): Promise<ParsedArticleQueryResponse> {
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
                    eq(favorite.user_id, userId),
                ),
            )
            .where(eq(article.slug, slug))

        //parse the response
        found.createdAt = getDateFromULID(found.createdAt).toISOString()
        found.tagList = (found.tagList as string).split(",")
        found.favorited = found.favorited === "1"
        found.favoritesCount = parseInt(found.favoritesCount as string)

        return found as unknown as ParsedArticleQueryResponse
    }
}

export const articlesService = new ArticlesService(db)
