import * as schema from "~/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { type Follow } from "./follows.types"
import { db } from "~/db"
import { createId } from "~/utils/id"

class FollowsService {
    private database: typeof db
    constructor(database: typeof db) {
        this.database = database
    }

    async followUser(followerId: string, followingId: string): Promise<Follow> {
        const alreadyFollowing = await this.database
            .select({
                exist: sql`1`,
            })
            .from(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .get()

        if (alreadyFollowing) {
            throw new Error(`Already following userId: ${followingId}`)
        }

        const follow = await this.database
            .insert(schema.follow)
            .values({
                id: createId(),
                follower_id: followerId,
                following_id: followingId,
            })
            .returning()
            .get()

        return follow
    }

    async unfollowUser(
        followerId: string,
        followingId: string,
    ): Promise<Follow> {
        const alreadyFollowing = await this.database
            .select({ exist: sql`1` })
            .from(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .get()

        if (!alreadyFollowing) {
            throw new Error(`Not following userId: ${followingId}`)
        }

        const follow = await this.database
            .delete(schema.follow)
            .where(
                and(
                    eq(schema.follow.follower_id, followerId),
                    eq(schema.follow.following_id, followingId),
                ),
            )
            .returning()
            .get()

        if (!follow) {
            throw new Error("Follow not found")
        }

        return follow
    }
}

export const followsService = new FollowsService(db)
