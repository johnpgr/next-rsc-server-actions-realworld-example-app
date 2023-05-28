import { db } from "~/db"
import { Profile, type User } from "./users.types"
import * as schema from "~/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { EditUser } from "./users.validation"
import { compare, hash as hashPassword } from "bcryptjs"
import { createId } from "~/utils/id"

export class UserService {
    private database: typeof db
    constructor(database: typeof db) {
        this.database = database
    }

    async getUser(userId: string): Promise<User | null> {
        const user = await this.database.query.user.findFirst({
            where: eq(schema.user.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
            },
        })

        return user ?? null
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.database.query.user.findFirst({
            where: eq(schema.user.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
            },
        })
        return user ?? null
    }

    async getUserByName(username: string): Promise<User | null> {
        const user = await this.database.query.user.findFirst({
            where: eq(schema.user.name, username),
            columns: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
            },
        })
        return user ?? null
    }

    async getUserProfile(
        username: string,
        currentUserId: string | null = null,
    ): Promise<Profile | null> {
        const found = await this.database.query.user.findFirst({
            columns: {
                id: true,
            },
            where: eq(schema.user.name, username),
        })

        if (!found) return null

        const { id: userId } = found

        const user = await this.database
            .select({
                id: schema.user.id,
                name: schema.user.name,
                bio: schema.user.bio,
                image: schema.user.image,
                following: sql`
                    EXISTS (
                        SELECT 1
                        FROM ${schema.follow}
                        WHERE ${and(
                            eq(schema.follow.follower_id, currentUserId || ""),
                            eq(schema.follow.following_id, userId),
                        )})`,
            })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1)
            .get()

        if (!user) return null

        user.following = user.following === 1

        return user as Profile
    }

    /**
     * @throws {Error}
     */
    async updateUser(username: string, input: EditUser): Promise<User> {
        const { user } = input

        const updatedUser = await this.database
            .update(schema.user)
            .set(user)
            .where(eq(schema.user.name, username))
            .returning()
            .get()

        return updatedUser
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
        const foundEmail = await this.database.query.user.findFirst({
            where: eq(schema.user.email, email),
            columns: {
                email: true,
            },
        })

        if (foundEmail) throw new Error("Email already in use")

        const foundUsername = await this.database.query.user.findFirst({
            where: eq(schema.user.name, username),
            columns: {
                name: true,
            },
        })

        if (foundUsername) throw new Error("Username already in use")

        const createdUser = await this.database
            .insert(schema.user)
            .values({
                id: createId(),
                email,
                password: await hashPassword(password, 12),
                image,
                name: username,
            })
            .returning({
                id: schema.user.id,
                name: schema.user.name,
                email: schema.user.email,
                bio: schema.user.bio,
                image: schema.user.image,
            })
            .get()

        return createdUser
    }

    async verifyCredentials(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.database.query.user.findFirst({
            where: eq(schema.user.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
                password: true,
            },
        })

        if (!user) return null

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) return null

        //@ts-ignore
        delete user.password

        return user
    }
}

export const usersService = new UserService(db)
