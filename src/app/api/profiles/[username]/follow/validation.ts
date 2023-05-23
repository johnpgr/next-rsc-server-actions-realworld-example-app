import { z } from 'zod'

export const followUserResponseSchema = z
    .object({
        success: z.literal(true),
        profile: z.object({
            username: z.string(),
            bio: z.string(),
            image: z.string(),
            following: z.boolean(),
        }),
    })
    .or(
        z.object({
            success: z.literal(false),
            error: z.string(),
        }),
    )

export type FollowUserResponse = z.infer<typeof followUserResponseSchema>
