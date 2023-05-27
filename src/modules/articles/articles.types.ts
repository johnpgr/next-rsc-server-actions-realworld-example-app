import { InferModel } from "drizzle-orm"
import { article } from "~/db/schema"

export type Article = {
    id: string
    title: string
    description: string
    body: string
    slug: string
    createdAt: Date
    updatedAt: Date
    author: {
        username: string
        bio: string | null
        image: string | null
    }
    tagList?: string[]
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

export type ArticleModel = InferModel<typeof article>

export type NewArticle = InferModel<typeof article, "insert"> & {
    tagList: string[]
}

export type UpdateArticle = Partial<NewArticle> & {
    id: string
    author_id: string
}
