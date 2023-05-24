import { eq } from 'drizzle-orm'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { User } from '../users/users.types'
import * as schema from '~/db/schema'
import { db } from '~/db'
import { SignJWT, errors, jwtVerify } from 'jose'
import { JWT_EXPIRATION_TIME } from '~/config/constants'
import { compare as comparePasswords } from 'bcryptjs'
import { createId } from '~/utils/ulid'
import { env } from '~/config/env.mjs'
import { UserJWTPayload } from './auth.types'

class AuthService {
    private db: PlanetScaleDatabase<typeof schema>

    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    /**
     * @throws {Error}
     */
    async verifyCredentials(email: string, password: string): Promise<User> {
        const [found] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, email))
            .limit(1)

        if (!found) throw new Error('Email or password is invalid')

        const valid = await comparePasswords(password, found.password)

        if (!valid) throw new Error('Email or password is invalid')

        return found
    }

    async createToken(
        user: Omit<User, 'password_id' | 'updated_at'>,
    ): Promise<string> {
        return await new SignJWT(user)
            .setProtectedHeader({ alg: 'HS512' })
            .setJti(createId())
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION_TIME.string)
            .sign(new TextEncoder().encode(env.JWT_SECRET))
    }

    /**
     * @throws {Error}
     */
    async getPayloadFromToken(token: string): Promise<UserJWTPayload | null> {
        try {
            const verified = await jwtVerify(
                token,
                new TextEncoder().encode(env.JWT_SECRET),
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

        if (!payload) throw new Error('Token to refresh is invalid')

        const newToken = await this.createToken(payload)

        return newToken
    }
}

export const authService = new AuthService(db)
