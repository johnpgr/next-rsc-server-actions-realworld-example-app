import { eq } from "drizzle-orm"
import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import {
    User,
    user,
    password as passwordTable,
    Password,
    NewPassword,
} from "~/db/schema"
import { db } from "~/db/drizzle-db"
import { SignJWT, errors, jwtVerify } from "jose"
import { JWT_EXPIRATION_TIME, getJwtSecretKey } from "~/lib/constants"
import { comparePasswords, hashPassword } from "~/lib/crypto"
import { EditUserInput } from "~/app/profile/(edit-user)/validation"
import { createId } from "~/lib/utils"

export interface UserJWTPayload {
    username: string
    email: string
    bio: string | null
    image: string | null
    jti: string
    iat: number
    exp: number
}

class AuthService {
    private db: PlanetScaleDatabase

    constructor(db: PlanetScaleDatabase) {
        this.db = db
    }

    /**
     * @throws {Error}
     */
    private async persistPasswordForUser(
        password: string,
    ): Promise<{ password_id: string }> {
        const { salt, hashedPassword } = await hashPassword(password)

        const id = createId()
        const { rowsAffected } = await this.db.insert(passwordTable).values({
            id,
            password: hashedPassword,
            salt,
        })

        if (rowsAffected === 0) throw new Error("Something went wrong")

        return { password_id: id }
    }

    /**
     * @throws {Error}
     */
    private async getPasswordForUser(
        password_id: string,
    ): Promise<Omit<NewPassword, "id">> {
        const [password] = await this.db
            .select({
                salt: passwordTable.salt,
                password: passwordTable.password,
            })
            .from(passwordTable)
            .where(eq(passwordTable.id, password_id))
            .limit(1)

        if (!password) throw new Error("Something went wrong")

        return password
    }

    /**
     * @throws {Error}
     */
    async updateUser(username: string, input: EditUserInput): Promise<User> {
        const { user: userInput } = input

        const { rowsAffected } = await this.db
            .update(user)
            .set(userInput)
            .where(eq(user.username, username))

        if (rowsAffected === 0) throw new Error("Something went wrong")

        const [updatedUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.username, username))
            .limit(1)

        if (!updatedUser) throw new Error("Something went wrong")

        return updatedUser
    }

    /**
     * @throws {Error}
     */
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

        if (foundEmail) throw new Error("Email already in use")

        const [foundUsername] = await this.db
            .select()
            .from(user)
            .where(eq(user.username, username))
            .limit(1)

        if (foundUsername) throw new Error("Username already in use")

        const { password_id } = await this.persistPasswordForUser(password)

        const { rowsAffected } = await this.db.insert(user).values({
            id: createId(),
            email,
            password_id,
            username,
        })

        if (rowsAffected === 0) throw new Error("Something went wrong")

        const [newUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (!newUser) throw new Error("Something went wrong")

        return newUser
    }

    /**
     * @throws {Error}
     */
    async verifyCredentials(email: string, password: string): Promise<User> {
        const [found] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (!found) throw new Error("Email or password is invalid")

        const { password: hashedPassword, salt } =
            await this.getPasswordForUser(found.password_id)

        const valid = await comparePasswords(password, hashedPassword, salt)

        if (!valid) throw new Error("Email or password is invalid")

        return found
    }

    async createToken(
        user: Omit<User, "id" | "password_id" | "created_at" | "updated_at">,
    ): Promise<string> {
        return await new SignJWT(user)
            .setProtectedHeader({ alg: "HS512" })
            .setJti(createId())
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION_TIME.string)
            .sign(new TextEncoder().encode(getJwtSecretKey()))
    }

    /**
     * @throws {Error}
     */
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

    /**
     * @throws {Error}
     */
    async refreshToken(token: string): Promise<string> {
        const payload = await this.getPayloadFromToken(token)

        if (!payload) throw new Error("Token to refresh is invalid")

        const newToken = await this.createToken(payload)

        return newToken
    }

    /**
     * @throws {Error}
     */
    async getUserIdByUserName(userName: string): Promise<string> {
        const [{ id }] = await this.db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.username, userName))
            .limit(1)

        if (!id) throw new Error("User not found")

        return id
    }
}

export const authService = new AuthService(db)
