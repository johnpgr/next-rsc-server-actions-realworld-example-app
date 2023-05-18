import { z } from "zod"

export const tokenValidationResponseSchema = z
    .object({
        success: z.literal(true),
        token: z.string(),
    })
    .or(
        z.object({
            success: z.literal(false),
            message: z.string(),
        }),
    )

export type TokenValidationResponse = z.infer<
    typeof tokenValidationResponseSchema
>
