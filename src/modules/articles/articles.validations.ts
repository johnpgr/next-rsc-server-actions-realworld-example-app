import { z } from "zod"
import { sessionSchema } from "../auth/auth.validation"

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

const articleInputSchema = z.object({
    title: z
        .string()
        .min(1, "Article title must have at least 1 character.")
        .max(191, "Article title length is too big."),
    description: z
        .string()
        .min(1, "Article description must have at least 1 character.")
        .max(191, "Article description is too big."),
    body: z.string().min(1, "Article body must have at least 1 character"),
    tagList: z
        .string()
        .nullable()
        .transform((val) => (val ? val.split(",") : null))
        .refine(
            (v) => {
                if (!v) return true
                return v.length <= 5
            },
            {
                message: "The tag list can have maximum 5 tags.",
                path: ["tagList"],
            },
        ),
})

export const newArticleBodySchema = z.object({
    article: articleInputSchema,
    session: sessionSchema,
})
export type NewArticleBody = z.infer<typeof newArticleBodySchema>

export const updateArticleBodySchema = z.object({
    slug: z.string(),
    article: articleInputSchema.partial(),
    session: sessionSchema,
})
export type UpdateArticleBody = z.infer<typeof updateArticleBodySchema>

export const deleteArticleBodySchema = z.object({
    slug: z.string(),
    session: sessionSchema,
})
