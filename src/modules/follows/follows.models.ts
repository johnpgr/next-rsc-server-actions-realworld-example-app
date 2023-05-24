import { index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const follow = mysqlTable(
    'follow',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        follower_id: varchar('follower_id', {
            length: 191,
        }).notNull(),
        following_id: varchar('following_id', {
            length: 191,
        }).notNull(),
        updated_at: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (follow) => ({
        followerIndex: index('follows__follower_id__idx').on(
            follow.follower_id,
        ),
        followingIndex: index('follows__following_id__idx').on(
            follow.following_id,
        ),
    }),
)
