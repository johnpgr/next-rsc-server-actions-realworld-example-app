import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db'
import { Profile, type User } from './users.types'
import { schema } from '~/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { createId } from '~/utils/ulid'
import { EditUser } from './users.validation'
import { hashPassword } from '~/lib/crypto'

export class UserService {
    private db: PlanetScaleDatabase<typeof schema>
    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    async getUser(userId: string): Promise<User | null> {
        const result = await this.db
            .select({
                id: schema.user.id,
                email: schema.user.email,
                username: schema.user.username,
                bio: schema.user.bio,
                image: schema.user.image,
            })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1)

        const user = result[0]

        if (!user) return null

        return user
    }

    async getUserProfile(
        username: string,
        currentUserId: string | null = null,
    ): Promise<Profile | null> {
        const found = await this.db.query.user.findFirst({
            columns: {
                id: true,
            },
            where: eq(schema.user.username, username),
        })

        if (!found) return null

        const { id: userId } = found

        const result = await this.db
            .select({
                username: schema.user.username,
                bio: schema.user.bio,
                image: schema.user.image,
                following: sql`
                    EXISTS (
                        SELECT 1
                        FROM ${schema.follow}
                        WHERE ${and(
                            eq(schema.follow.follower_id, currentUserId || ''),
                            eq(schema.follow.following_id, userId),
                        )})`,
            })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1)

        const user = result[0]

        if (!user) return null

        //@ts-ignore
        user.following = user.following === '1'

        return user as Profile
    }

    /**
     * @throws {Error}
     */
    async updateUser(username: string, input: EditUser): Promise<User> {
        const { user: userInput } = input

        const { rowsAffected } = await this.db
            .update(schema.user)
            .set(userInput)
            .where(eq(schema.user.username, username))

        if (rowsAffected === 0) throw new Error('Something went wrong')

        const [updatedUser] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.username, username))
            .limit(1)

        if (!updatedUser) throw new Error('Something went wrong')

        return updatedUser
    }

    /**
     * @throws {Error}
     */
    private async persistPasswordForUser(
        password: string,
    ): Promise<{ password_id: string }> {
        const { salt, hashedPassword } = await hashPassword(password)

        const id = createId()
        const { rowsAffected } = await this.db.insert(schema.password).values({
            id,
            password: hashedPassword,
            salt,
        })

        if (rowsAffected === 0) throw new Error('Something went wrong')

        return { password_id: id }
    }

    /**
     * @throws {Error}
     */
    async createUser(input: {
        email: string
        password: string
        username: string
        image: string
    }): Promise<User> {
        const { email, password, username, image } = input
        const [foundEmail] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, email))
            .limit(1)

        if (foundEmail) throw new Error('Email already in use')

        const [foundUsername] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.username, username))
            .limit(1)

        if (foundUsername) throw new Error('Username already in use')

        const { password_id } = await this.persistPasswordForUser(password)

        const { rowsAffected } = await this.db.insert(schema.user).values({
            id: createId(),
            email,
            password_id,
            image,
            username,
        })

        if (rowsAffected === 0) throw new Error('Something went wrong')

        const [newUser] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, email))
            .limit(1)

        if (!newUser) throw new Error('Something went wrong')

        return newUser
    }
}

export const usersService = new UserService(db)
