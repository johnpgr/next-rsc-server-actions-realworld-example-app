export const USER_TOKEN = "user_token"

export const SALT_LENGTH = 16
export const HASH_ITERATIONS = 100_000
export const HASH_KEY_LENGTH = 64
export const HASH_ALGORITHM = "SHA-512"
export const JWT_EXPIRATION_TIME = {
    string: "2h",
    seconds: 7200,
} as const

export const DEFAULT_USER_IMAGE =
    "https://api.realworld.io/images/smiley-cyrus.jpeg"

export const HEADER_HEIGHT = "64px"
