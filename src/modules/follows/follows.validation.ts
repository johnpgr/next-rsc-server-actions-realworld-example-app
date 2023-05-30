import { z } from "zod"

export const followUserSchema = z.object({
    followingId: z.string(),
})
