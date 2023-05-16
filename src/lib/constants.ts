import { env } from "~/config/env.mjs"

export const USER_TOKEN = "user_token"

export const SALT_ROUNDS = 12

export const QUERY_KEYS = {
    LOGIN: "login",
}

export function getJwtSecretKey(): string {
    return env.JWT_SECRET
}
