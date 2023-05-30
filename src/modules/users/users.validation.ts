import { z } from "zod"
import { passwordRegex } from "../auth/auth.validation"

export const updateUserSchema = z.object({
    user: z.object({
        username: z.string().min(3).max(20).optional(),
        email: z.string().email().optional(),
        password: z
            .string()
            .regex(passwordRegex, {
                message:
                    "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special case character",
            })
            .optional(),
        bio: z.string().max(255).optional(),
        image: z.string().url().optional(),
    }),
})
