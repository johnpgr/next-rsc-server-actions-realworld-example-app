import { user } from "../auth/auth.models"
import { InferModel } from "drizzle-orm"

export type UserModel = InferModel<typeof user>
export type NewUser = InferModel<typeof user, "insert">

export type User = Omit<UserModel, "password" | "updated_at">

export type UserToken = User & {
    token: string
}

export type Profile = Omit<User, "email"> & {
    following: boolean
}
