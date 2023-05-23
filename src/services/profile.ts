import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db/drizzle-db'
import { type User } from '~/db/schema'
import * as schema from '~/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { createId } from '~/lib/utils'

export type Profile = Omit<
    User,
    'id' | 'password_id' | 'email' | 'created_at' | 'updated_at'
> & { following: boolean }

export class ProfileService {
    private db: PlanetScaleDatabase<typeof schema>
    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    async getProfile(
        userId: string,
        currentUserId: string | null = null,
    ): Promise<Profile | null> {
        const result = await this.db
            .select({
                username: schema.user.username,
                bio: schema.user.bio,
                image: schema.user.image,
                following: sql<string>`
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

        const profile = result[0]

        if (!profile) return null

        //@ts-ignore
        profile.following = profile.following === '1'

        //@ts-ignore
        return profile
    }

    async getProfileByUsername(
        username: string,
        currentUserId: string | null = null,
    ): Promise<Profile | null> {
        const result = await this.db
            .select({
                username: schema.user.username,
                bio: schema.user.bio,
                image: schema.user.image,
                following: sql<string>`
                    EXISTS (
                        SELECT 1
                        FROM ${schema.follow}
                        WHERE ${and(
                            eq(schema.follow.follower_id, currentUserId || ''),
                            eq(schema.follow.following_id, schema.user.id),
                        )})`,
            })
            .from(schema.user)
            .where(eq(schema.user.username, username))
            .limit(1)

        const profile = result[0]

        if (!profile) return null

        //@ts-ignore
        profile.following = profile.following === '1'

        //@ts-ignore
        return profile
    }

    async followUser(
        followerId: string,
        followingId: string,
    ): Promise<Profile> {
        const [alreadyFollowing] = await this.db
            .select()
            .from(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .limit(1)

        if (alreadyFollowing) {
            const [found] = await this.db
                .select({ username: schema.user.username })
                .from(schema.user)
                .where(eq(schema.user.id, followingId))
                .limit(1)
            throw new Error(`Already following user: ${found.username}`)
        }

        await this.db.insert(schema.follow).values({
            id: createId(),
            follower_id: followerId,
            following_id: followingId,
        })

        const profile = await this.getProfile(followingId, followerId)

        if (!profile) throw new Error('Profile not found')

        return profile
    }

    async unfollowUser(
        followerId: string,
        followingId: string,
    ): Promise<Profile> {
        const [alreadyFollowing] = await this.db
            .select()
            .from(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .limit(1)

        if (!alreadyFollowing) {
            const [found] = await this.db
                .select({ username: schema.user.username })
                .from(schema.user)
                .where(eq(schema.user.id, followingId))
                .limit(1)
            throw new Error(`Not following user: ${found.username}`)
        }

        await this.db
            .delete(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )

        const profile = await this.getProfile(followingId, followerId)

        if (!profile) throw new Error('Profile not found')

        return profile
    }
}

export const profileService = new ProfileService(db)
