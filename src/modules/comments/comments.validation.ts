import { z } from "zod"

export const createCommentSchema = z.object({
    body: z
        .string()
        .min(1, "Comment length must be greater than 1 character")
        .max(500, "Comment length must be less than 500 characters"),
})

export type CreateComment = z.infer<typeof createCommentSchema>
