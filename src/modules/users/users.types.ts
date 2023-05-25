import { user } from "~/db/schema"
import { InferModel } from "drizzle-orm"

export type UserModel = InferModel<typeof user>
export type NewUser = InferModel<typeof user, "insert">

export type User = Omit<UserModel, "password" | "updated_at" | "created_at" | "emailVerified">

export type UserToken = User & {
    token: string
}

export type Profile = Omit<User, "email"> & {
    following: boolean
}
