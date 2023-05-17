import { z } from "zod"

export const tokenValidationResponseSchema = z
    .object({
        token: z.string(),
    })
    .or(
        z.object({
            message: z.string(),
        }),
    )

export type TokenValidationResponse = z.infer<typeof tokenValidationResponseSchema>
