import { z } from "zod";

export const createCommentBodySchema = z.object({
    comment: z.object({
        body: z.string().min(1).max(500),
    }),
})

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>