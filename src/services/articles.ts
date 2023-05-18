import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { db } from "~/db/drizzle-db"
import { sql } from "drizzle-orm"

export type GetArticlesParams = {
    tag: string | null
    authorName: string | null
    favoritedBy: string | null
    limit: number
    offset: number
}

export type ArticleQueryResponse = {
    title: string
    description: string
    body: string
    slug: string
    createdAt: Date
    updatedAt: Date
    authorName: string
    authorBio: string
    authorImage: string
    tagList: string
    favoritesCount: string
    favorited: number
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

    async getArticles(params: GetArticlesParams, currentUserId: string | null) {
        const { tag, authorName, favoritedBy, limit, offset } = params

        const articles = await this.db.execute(sql`
            SELECT a.title, a.description, a.body, a.slug, a.created_at as createdAt, a.updated_at as updatedAt,
                   u.name AS authorName, u.bio AS authorBio, u.image AS authorImage,
                   (
                       SELECT GROUP_CONCAT(t.name SEPARATOR ',')
                       FROM tag t
                       WHERE t.article_id = a.id
                   ) AS tagList,
                   COALESCE(favorites.favoritesCount, 0) AS favoritesCount,
                   IF(f.user_id IS NOT NULL, 1, 0) AS favorited
            FROM article a
            JOIN user u ON a.author_id = u.id
            LEFT JOIN (
                SELECT article_id, COUNT(*) AS favoritesCount
                FROM favorite
                GROUP BY article_id
            ) AS favorites ON a.id = favorites.article_id
            LEFT JOIN favorite f ON a.id = f.article_id AND f.user_id = ${currentUserId}
            WHERE (${authorName} IS NULL OR u.name = ${authorName})
              AND (${favoritedBy} IS NULL OR EXISTS (
                SELECT 1
                FROM favorite f
                JOIN user uf ON f.user_id = uf.id
                WHERE a.id = f.article_id AND uf.name = ${favoritedBy}
              ))
              AND (${tag} IS NULL OR EXISTS (
                SELECT 1
                FROM tag t
                WHERE t.article_id = a.id AND t.name = ${tag} 
              ))
            GROUP BY a.id, a.created_at
            ORDER BY a.created_at DESC
            LIMIT ${limit} OFFSET ${offset};`)

        //parse the response
        for (let article of articles.rows as ArticleQueryResponse[]) {
            //@ts-ignore
            article.createdAt = new Date(article.createdAt).toISOString()
            //@ts-ignore
            article.updatedAt = new Date(article.updatedAt).toISOString()
            //@ts-ignore
            article.tagList = article.tagList.split(",")
            //@ts-ignore
            article.favorited = article.favorited === 1
            //@ts-ignore
            article.favoritesCount = parseInt(article.favoritesCount)

            const author = {
                username: article.authorName,
                bio: article.authorBio,
                image: article.authorImage,
            }

            //@ts-ignore
            delete article.authorName
            //@ts-ignore
            delete article.authorBio
            //@ts-ignore
            delete article.authorImage

            //@ts-ignore
            article.author = author
        }

        return articles.rows as ParsedArticleQueryResponse[]
    }
}

export const articlesService = new ArticlesService(db)
