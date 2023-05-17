import { z } from "zod"

export const getTokenExpResponseSchema = z
    .object({
        exp: z.number(),
    })
    .or(
        z.object({
            message: z.string(),
        }),
    )

export type TokenExpResponse = z.infer<typeof getTokenExpResponseSchema>
