import { z } from 'zod'

export const favoriteArticleSchema = z.object({
    article: z.object({
        slug: z.string(),
    }),
})
