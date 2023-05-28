import { user } from "~/db/schema"
import { InferModel } from "drizzle-orm"
import { z } from "zod"
import { updateUserSchema } from "./users.validation"

export type UserModel = InferModel<typeof user>
export type NewUser = InferModel<typeof user, "insert">

export type User = Omit<UserModel, "password" | "updated_at" | "emailVerified">

export type UserToken = User & {
    token: string
}

export type Profile = Omit<User, "email"> & {
    following: boolean
}

export type UpdateUser = z.infer<typeof updateUserSchema>
