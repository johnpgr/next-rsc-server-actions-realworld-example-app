import { z } from "zod"

export const getCurrentUserResponseSchema = z
    .object({
        success: z.literal(true),
        user: z.object({
            id: z.string(),
            email: z.string(),
            token: z.string(),
            username: z.string(),
            bio: z.string().nullable(),
            image: z.string().nullable(),
        }),
    })
    .or(
        z.object({
            success: z.literal(false),
            message: z.string(),
        }),
    )

export type CurrentUserResponse = z.infer<typeof getCurrentUserResponseSchema>
