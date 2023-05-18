import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import { db } from "~/db/drizzle-db"
import { User, user, follow } from "~/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { nanoid } from "nanoid"

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

    async followUser(
        followerName: string,
        followingName: string,
    ): Promise<Profile> {
        const [alreadyFollowing] = await this.db
            .select()
            .from(follow)
            .where(
                and(
                    eq(follow.follower_username, followerName),
                    eq(follow.following_username, followingName),
                ),
            )
            .limit(1)

        if (alreadyFollowing)
            throw new Error(`Already following user: ${followingName}`)

        await this.db.insert(follow).values({
            id: nanoid(),
            follower_username: followerName,
            following_username: followingName,
        })

        const profile = await this.getProfile(followingName, followerName)

        if (!profile) throw new Error("Profile not found")

        return profile
    }

    async unfollowUser(
        followerName: string,
        followingName: string,
    ): Promise<Profile> {
        const [alreadyFollowing] = await this.db
            .select()
            .from(follow)
            .where(
                and(
                    eq(follow.follower_username, followerName),
                    eq(follow.following_username, followingName),
                ),
            )
            .limit(1)

        if (!alreadyFollowing)
            throw new Error(`Not following user: ${followingName}`)

        await this.db
            .delete(follow)
            .where(
                and(
                    eq(follow.follower_username, followerName),
                    eq(follow.following_username, followingName),
                ),
            )

        const profile = await this.getProfile(followingName, followerName)

        if (!profile) throw new Error("Profile not found")

        return profile
    }
}

export const profileService = new ProfileService(db)
