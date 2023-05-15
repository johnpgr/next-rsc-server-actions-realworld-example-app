import { env } from "~/config/env.mjs"

export const USER_TOKEN = "user_token"

export function getJwtSecretKey(): string {
    return env.JWT_SECRET
}
