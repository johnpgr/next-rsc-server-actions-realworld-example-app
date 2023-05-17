import { z } from "zod"

export enum JWT_ERROR_CODES {
    ERR_TOKEN_NOTFOUND = "ERR_TOKEN_NOTFOUND",
    ERR_JWT_EXPIRED = "ERR_JWT_EXPIRED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export const getTokenExpResponseSchema = z
    .object({
        success: z.literal(true),
        exp: z.number(),
    })
    .or(
        z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.nativeEnum(JWT_ERROR_CODES),
        }),
    )
export type TokenExpResponse = z.infer<typeof getTokenExpResponseSchema>
