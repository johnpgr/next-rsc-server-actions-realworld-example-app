import { z } from "zod"
import { sessionSchema } from "../auth/auth.validation"

export const followUserSchema = z.object({
    followingId: z.string(),
    session: sessionSchema,
})
