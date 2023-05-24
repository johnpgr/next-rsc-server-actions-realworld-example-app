import { user, password } from '../auth/auth.models'
import { InferModel } from 'drizzle-orm'

export type UserModel = InferModel<typeof user>
export type NewUser = InferModel<typeof user, 'insert'>

export type Password = InferModel<typeof password>
export type NewPassword = InferModel<typeof password, 'insert'>

export type User = Omit<UserModel, 'password_id' | 'updated_at'>

export type UserToken = User & {
    token: string
}

export type Profile = Omit<User, 'id' | 'email'> & {
    following: boolean
}
