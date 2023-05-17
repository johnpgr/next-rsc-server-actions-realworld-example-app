import { z } from "zod"

export const loginResponseSchema = z
    .object({
        success: z.literal(true),
        user: z.object({
            email: z.string(),
            username: z.string(),
            bio: z.string().nullable(),
            image: z.string().nullable(),
            token: z.string(),
        }),
    })
    .or(
        z.object({
            success: z.literal(false),
            message: z.string(),
        }),
    )
export type LoginResponse = z.infer<typeof loginResponseSchema>
