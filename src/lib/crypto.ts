// Function to generate a random salt
function generateSalt() {
    const saltBytes = new Uint8Array(16)
    crypto.getRandomValues(saltBytes)
    return Array.from(saltBytes, (byte) =>
        ("0" + byte.toString(16)).slice(-2),
    ).join("")
}

// Function to hash the password with the specified salt rounds
export async function hashPassword(password: string, saltRounds: number) {
    const salt = generateSalt()
    const saltBuffer = Buffer.from(salt, "hex")
    const derivedKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    )
    const hashedKey = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: saltRounds,
            hash: "SHA-256",
        },
        derivedKey,
        256,
    )
    const hashedPassword = Array.from(new Uint8Array(hashedKey))
        .map((byte) => ("0" + byte.toString(16)).slice(-2))
        .join("")
    return { salt, hashedPassword }
}

// Function to compare a password with a hashed password
export async function comparePasswords(password:string, hashedPassword:string, salt:string, saltRounds:number) {
    const saltBuffer = Buffer.from(salt, "hex")
    const derivedKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    )
    const hashedKey = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: saltRounds,
            hash: "SHA-256",
        },
        derivedKey,
        256,
    )
    const hashedPasswordToCompare = Array.from(new Uint8Array(hashedKey))
        .map((byte) => ("0" + byte.toString(16)).slice(-2))
        .join("")
    return hashedPassword === hashedPasswordToCompare
}

