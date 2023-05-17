import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { db } from "~/db/drizzle-db"
import { User, user, follow } from "~/db/schema"
import { SQL, and, eq, exists, sql } from "drizzle-orm"

export type Profile = Omit<
    User,
    "id" | "password_id" | "email" | "created_at" | "updated_at"
> & { following: boolean }

export class ProfileService {
    private db: PlanetScaleDatabase
    constructor(db: PlanetScaleDatabase) {
        this.db = db
    }

    async getProfile(
        username: string,
        currentUser?: string,
    ): Promise<Profile | null> {
        const result = await this.db
            .select({
                username: user.username,
                bio: user.bio,
                image: user.image,
                following: sql<string>`
                    EXISTS (
                        SELECT 1
                        FROM ${follow}
                        WHERE ${and(
                            eq(follow.follower_username, currentUser || ""),
                            eq(follow.following_username, username),
                        )})`,
            })
            .from(user)
            .where(eq(user.username, username))
            .limit(1)

        const profile = result[0]

        if (!profile) return null

        //@ts-ignore
        profile.following = profile.following === "1"

        //@ts-ignore
        return profile
    }
}

export const profileService = new ProfileService(db)
