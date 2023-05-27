import { z } from "zod"
import { sessionSchema } from "../auth/auth.validation"

export const favoriteArticleSchema = z.object({
    article: z.object({
        slug: z.string(),
    }),
    session: sessionSchema
})
