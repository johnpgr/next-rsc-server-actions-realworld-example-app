import { z } from "zod"

export const getTokenExpResponseSchema = z
    .object({
        success: z.literal(true),
        exp: z.number(),
    })
    .or(
        z.object({
            success: z.literal(false),
            message: z.string(),
        }),
    )
export type TokenExpResponse = z.infer<typeof getTokenExpResponseSchema>
