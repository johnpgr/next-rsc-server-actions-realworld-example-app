import { InferModel } from "drizzle-orm"
import { article } from "./articles.models"

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

export type GetArticlesParams = {
    tag: string | null
    authorName: string | null
    favoritedBy: string | null
    limit: number
    offset: number
}

export type NewArticle = InferModel<typeof article, "insert"> & {
    tagList: string[]
}

export type UpdateArticle = Partial<NewArticle> & {
    id: string
    author_id: string
}
