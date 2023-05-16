import { env } from "~/config/env.mjs"

export const USER_TOKEN = "user_token"

export const SALT_LENGTH = 16
export const HASH_ITERATIONS = 100_000
export const HASH_KEY_LENGTH = 64
export const HASH_ALGORITHM = "SHA-512"

export const QUERY_KEYS = {
    LOGIN: "login",
}

export function getJwtSecretKey(): string {
    return env.JWT_SECRET
}
