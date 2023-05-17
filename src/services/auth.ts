import { eq } from "drizzle-orm"
import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { User, user, password as passwordTable, Password } from "~/db/schema"
import { db } from "~/db/drizzle-db"
import { SignJWT, errors, jwtVerify } from "jose"
import { JWT_EXPIRATION_TIME, getJwtSecretKey } from "~/lib/constants"
import { nanoid } from "nanoid"
import { comparePasswords, hashPassword } from "~/lib/crypto"
import { EditUserInput } from "~/app/profile/(edit-user)/validation"

export interface UserJWTPayload {
    id: string
    username: string
    email: string
    bio: string | null
    image: string | null
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

    private async persistPasswordForUser(
        password: string,
    ): Promise<{ password_id: string }> {
        const { salt, hashedPassword } = await hashPassword(password)

        const id = nanoid()
        const { rowsAffected } = await this.db.insert(passwordTable).values({
            id,
            password: hashedPassword,
            salt,
        })

        if (rowsAffected === 0) throw new AuthError("Something went wrong")

        return { password_id: id }
    }

    private async getPasswordForUser(
        password_id: string,
    ): Promise<Omit<Password, "id">> {
        const [password] = await this.db
            .select({
                salt: passwordTable.salt,
                password: passwordTable.password,
            })
            .from(passwordTable)
            .where(eq(passwordTable.id, password_id))
            .limit(1)

        if (!password) throw new AuthError("Something went wrong")

        return password
    }

    async updateUser(input: EditUserInput & { id: string }): Promise<User> {
        const { id, user: userInput } = input
        console.log({ input })

        const { rowsAffected } = await this.db
            .update(user)
            .set(userInput)
            .where(eq(user.id, id))

        if (rowsAffected === 0) throw new AuthError("Something went wrong")

        const [updatedUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.id, id))
            .limit(1)

        if (!updatedUser) throw new AuthError("Something went wrong")

        return updatedUser
    }

    async registerUser(
        email: string,
        password: string,
        username: string,
    ): Promise<User> {
        const [foundEmail] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (foundEmail) throw new AuthError("Email already in use")

        const [foundUsername] = await this.db
            .select()
            .from(user)
            .where(eq(user.username, username))
            .limit(1)

        if (foundUsername) throw new AuthError("Username already in use")

        const { password_id } = await this.persistPasswordForUser(password)

        const { rowsAffected } = await this.db.insert(user).values({
            id: nanoid(),
            email,
            password_id,
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

        if (!found) throw new AuthError("Email or password is invalid")

        const { password: hashedPassword, salt } =
            await this.getPasswordForUser(found.password_id)

        const valid = await comparePasswords(password, hashedPassword, salt)

        if (!valid) throw new AuthError("Email or password is invalid")

        return found
    }

    async createToken(
        user: Omit<User, "password_id" | "created_at" | "updated_at">,
    ): Promise<string> {
        return await new SignJWT(user)
            .setProtectedHeader({ alg: "HS512" })
            .setJti(nanoid())
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION_TIME.string)
            .sign(new TextEncoder().encode(getJwtSecretKey()))
    }

    async getPayloadFromToken(token: string): Promise<UserJWTPayload | null> {
        try {
            const verified = await jwtVerify(
                token,
                new TextEncoder().encode(getJwtSecretKey()),
            )

            const payload = verified.payload as unknown as UserJWTPayload

            return payload
        } catch (error) {
            if (error instanceof errors.JWTExpired) {
                return null
            }

            throw error
        }
    }

    async refreshToken(token: string) {
        const payload = await this.getPayloadFromToken(token)

        if(!payload) throw new AuthError("Token to refresh is invalid")

        const newToken = await this.createToken(payload)

        return newToken
    }
}

export const authService = new AuthService(db)
