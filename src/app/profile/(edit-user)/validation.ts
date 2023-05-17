import { z } from "zod"

export const editUserInputSchema = z.object({
    user: z.object({
        username: z.string().min(3).max(20).optional(),
        email: z.string().email().optional(),
        password: z.string().min(8).max(40).optional(),
        bio: z.string().max(100).optional(),
        image: z.string().url().optional(),
    }),
})

export type EditUserInput = z.infer<typeof editUserInputSchema>
