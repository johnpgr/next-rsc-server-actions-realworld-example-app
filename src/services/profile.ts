import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db/drizzle-db'
import { User, user, follow } from '~/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { createId } from '~/lib/utils'

export type Profile = Omit<
    User,
    'id' | 'password_id' | 'email' | 'created_at' | 'updated_at'
> & { following: boolean }

export class ProfileService {
    private db: PlanetScaleDatabase
    constructor(db: PlanetScaleDatabase) {
        this.db = db
    }

    async getProfile(
        userId: string,
        currentUserId?: string,
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
                            eq(follow.follower_id, currentUserId || ''),
                            eq(follow.following_id, userId),
                        )})`,
            })
            .from(user)
            .where(eq(user.id, userId))
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
            .from(follow)
            .where(
                and(
                    eq(follow.follower_id, followerId),
                    eq(follow.following_id, followingId),
                ),
            )
            .limit(1)

        if (alreadyFollowing) {
            const [found] = await this.db
                .select({ username: user.username })
                .from(user)
                .where(eq(user.id, followingId))
                .limit(1)
            throw new Error(`Already following user: ${found.username}`)
        }

        await this.db.insert(follow).values({
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
            .from(follow)
            .where(
                and(
                    eq(follow.follower_id, followerId),
                    eq(follow.following_id, followingId),
                ),
            )
            .limit(1)

        if (!alreadyFollowing) {
            const [found] = await this.db
                .select({ username: user.username })
                .from(user)
                .where(eq(user.id, followingId))
                .limit(1)
            throw new Error(`Not following user: ${found.username}`)
        }

        await this.db
            .delete(follow)
            .where(
                and(
                    eq(follow.follower_id, followerId),
                    eq(follow.following_id, followingId),
                ),
            )

        const profile = await this.getProfile(followingId, followerId)

        if (!profile) throw new Error('Profile not found')

        return profile
    }
}

export const profileService = new ProfileService(db)
