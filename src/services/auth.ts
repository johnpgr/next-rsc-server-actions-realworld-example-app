import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { User, user } from "~/db/schema"
import { db } from "~/db/drizzle-db"
import { SignJWT, jwtVerify } from "jose"
import { getJwtSecretKey } from "~/lib/constants"
import { nanoid } from "nanoid"

interface UserJWTPayload {
    username: string
    email: string
    bio: string
    image: string
    jti: string
    iat: number
    exp: number
}

export class AuthError extends Error {}

class AuthService {
    private db: PlanetScaleDatabase

    constructor(db: PlanetScaleDatabase) {
        this.db = db
    }

    async registerUser(
        email: string,
        password: string,
        username: string,
    ): Promise<User> {
        const [found] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (found) throw new AuthError("Email already in use")

        const { rowsAffected } = await this.db.insert(user).values({
            id: nanoid(),
            email,
            password: await bcrypt.hash(password, 12),
            username,
        })

        if (rowsAffected === 0) throw new AuthError("Something went wrong")

        const [newUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (!newUser) throw new AuthError("Something went wrong")

        return newUser
    }

    async verifyCredentials(email: string, password: string): Promise<User> {
        const [found] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (!found) throw new AuthError("Invalid credentials")

        const valid = await bcrypt.compare(password, found.password)

        if (!valid) throw new AuthError("Invalid credentials")

        return found
    }

    /**
     * Adds the user token cookie to a response.
     */
    async createToken(
        user: Omit<User, "id" | "password" | "created_at" | "updated_at">,
    ): Promise<string> {
        return await new SignJWT(user)
            .setProtectedHeader({ alg: "HS256" })
            .setJti(nanoid())
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(new TextEncoder().encode(getJwtSecretKey()))
    }

    async verifyToken(token: string): Promise<UserJWTPayload> {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(getJwtSecretKey()),
        )

        const payload = verified.payload as unknown as UserJWTPayload

        return payload
    }
}

export const authService = new AuthService(db)
