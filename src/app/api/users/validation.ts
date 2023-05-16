import { z } from "zod"

export const registerResponseSchema = z
    .object({
        user: z.object({
            token: z.string(),
            email: z.string(),
            username: z.string(),
            bio: z.string().nullable(),
            image: z.string().nullable(),
        }),
    })
    .or(
        z.object({
            message: z.string(),
        }),
    )

export type RegisterResponse = z.infer<typeof registerResponseSchema>
