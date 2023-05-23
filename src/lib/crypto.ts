import {
    SALT_LENGTH,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM,
    HASH_ITERATIONS,
} from './constants'

// Function to generate a random salt
function generateSalt() {
    const saltBytes = new Uint8Array(SALT_LENGTH)
    crypto.getRandomValues(saltBytes)
    return Array.from(saltBytes, (byte) =>
        ('0' + byte.toString(16)).slice(-2),
    ).join('')
}

// Function to hash the password with the specified salt rounds
export async function hashPassword(password: string) {
    const salt = generateSalt()
    const saltBuffer = Buffer.from(salt, 'hex')
    const derivedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits'],
    )
    const hashedKey = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: HASH_ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        derivedKey,
        HASH_KEY_LENGTH * 8,
    )
    const hashedPassword = Array.from(new Uint8Array(hashedKey))
        .map((byte) => ('0' + byte.toString(16)).slice(-2))
        .join('')
    return { salt, hashedPassword }
}

// Function to compare a password with a hashed password
export async function comparePasswords(
    password: string,
    hashedPassword: string,
    salt: string,
) {
    const saltBuffer = Buffer.from(salt, 'hex')
    const derivedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits'],
    )
    const hashedKey = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: HASH_ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        derivedKey,
        HASH_KEY_LENGTH * 8,
    )
    const hashedPasswordToCompare = Array.from(new Uint8Array(hashedKey))
        .map((byte) => ('0' + byte.toString(16)).slice(-2))
        .join('')
    return hashedPassword === hashedPasswordToCompare
}
