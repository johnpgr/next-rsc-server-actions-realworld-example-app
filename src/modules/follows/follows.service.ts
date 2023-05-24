import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import * as schema from '~/db/schema'
import { usersService } from '../users/users.service'
import { and, eq } from 'drizzle-orm'
import { createId } from '~/utils/ulid'
import { Profile } from '../users/users.types'
import { db } from '~/db'

class FollowsService {
    private db: PlanetScaleDatabase<typeof schema>
    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    async followUser(followerId: string, followingId: string): Promise<void> {
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

        const { rowsAffected } = await this.db.insert(schema.follow).values({
            id: createId(),
            follower_id: followerId,
            following_id: followingId,
        })

        if (rowsAffected !== 1) {
            throw new Error('Failed to follow user')
        }
    }

    async unfollowUser(followerId: string, followingId: string): Promise<void> {
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

        const { rowsAffected } = await this.db
            .delete(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )

        if (rowsAffected !== 1) {
            throw new Error('Failed to unfollow user')
        }
    }
}

export const followsService = new FollowsService(db)
