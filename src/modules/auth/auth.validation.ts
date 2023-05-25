import { z } from "zod"

export const loginInputSchema = z
    .object({
        user: z.object({
            email: z.string().email(),
            password: z.string(),
        }),
    })
    .strict()

export type LoginInput = z.infer<typeof loginInputSchema>

// Password must contain at least 8 characters, one uppercase, one number and one special character
export const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/

export const registerInputSchema = z
    .object({
        user: z.object({
            email: z.string().email(),
            // Password must contain at least 8 characters, one uppercase, one lowercase and one number
            password: z.string(),
            username: z.string(),
        }),
    })
    .strict()
