import { z } from "zod"

export const loginResponseSchema = z
    .object({
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
            message: z.string(),
        }),
    )
export type LoginResponse = z.infer<typeof loginResponseSchema>
