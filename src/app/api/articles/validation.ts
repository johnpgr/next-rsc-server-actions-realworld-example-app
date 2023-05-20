import { z } from "zod"

export const articleSchema = z.object({
    title: z.string(),
    description: z.string(),
    body: z.string(),
    slug: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    author: z.object({
        username: z.string(),
        bio: z.string(),
        image: z.string(),
    }),
    tagList: z.array(z.string()),
    favoritesCount: z.number(),
    favorited: z.boolean(),
})

export const getArticlesSchema = z.object({
    articles: z.array(articleSchema),
    articlesCount: z.number(),
})

export const newArticleBodychema = z.object({
    article: z.object({
        title: z.string(),
        description: z.string(),
        body: z.string(),
        tagList: z.array(z.string()).optional(),
    }),
})
export type NewArticleBody = z.infer<typeof newArticleBodychema>