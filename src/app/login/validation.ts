import { z } from 'zod'

export const loginInputSchema = z
    .object({
        user: z.object({
            email: z.string().email(),
            password: z.string(),
        }),
    })
    .strict()

export type LoginInput = z.infer<typeof loginInputSchema>
