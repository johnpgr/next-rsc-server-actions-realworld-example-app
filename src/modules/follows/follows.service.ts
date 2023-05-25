import * as schema from "~/db/schema"
import { and, eq } from "drizzle-orm"
import { type Follow } from "./follows.types"
import { db } from "~/db"

class FollowsService {
    private database: typeof db
    constructor(database: typeof db) {
        this.database = database
    }

    async followUser(followerId: string, followingId: string): Promise<Follow> {
        const [alreadyFollowing] = await this.database
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
            throw new Error(`Already following userId: ${followingId}`)
        }

        const [follow] = await this.database
            .insert(schema.follow)
            .values({
                follower_id: followerId,
                following_id: followingId,
            })
            .returning()

        return follow
    }

    async unfollowUser(
        followerId: string,
        followingId: string,
    ): Promise<Follow> {
        const [alreadyFollowing] = await this.database
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
            throw new Error(`Not following userId: ${followingId}`)
        }

        const [follow] = await this.database
            .delete(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .returning()

        return follow
    }
}

export const followsService = new FollowsService(db)
