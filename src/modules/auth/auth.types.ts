import { User } from "../users/users.types"

export type UserJWTPayload = User & {
    jti: string
    iat: number
    exp: number
}