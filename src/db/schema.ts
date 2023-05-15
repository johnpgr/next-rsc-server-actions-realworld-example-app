import { InferModel } from "drizzle-orm"
import {
    datetime,
    index,
    int,
    mysqlTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core"

export const user = mysqlTable(
    "user",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        username: varchar("name", { length: 191 }),
        email: varchar("email", { length: 191 }).notNull(),
        password: text("password").notNull(),
        image: varchar("image", { length: 191 }),
        bio: text("bio"),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (user) => ({
        nameIndex: index("users__name__idx").on(user.username),
        emailIndex: uniqueIndex("users__email__idx").on(user.email),
    }),
)

export type User = InferModel<typeof user>

export const article = mysqlTable(
    "article",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        author_id: varchar("author_id", { length: 191 }).notNull(),
        slug: varchar("slug", { length: 191 }).notNull(),
        title: text("title").notNull(),
        text: text("text").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (post) => ({
        userIdIndex: index("posts__user_id__idx").on(post.author_id),
    }),
)

export const favorite = mysqlTable(
    "favorite",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        user_id: varchar("user_id", { length: 191 }).notNull(),
        article_id: varchar("article_id", { length: 191 }).notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (favorite) => ({
        userIdIndex: index("favorites__user_id__idx").on(favorite.user_id),
        articleIdIndex: index("favorites__article_id__idx").on(
            favorite.article_id,
        ),
    }),
)

export const comment = mysqlTable(
    "comment",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        author_id: varchar("author_id", { length: 191 }).notNull(),
        article_id: varchar("article_id", { length: 191 }).notNull(),
        text: text("text").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (comment) => ({
        userIdIndex: index("comments__user_id__idx").on(comment.author_id),
        articleIdIndex: index("comments__article_id__idx").on(
            comment.article_id,
        ),
    }),
)

export const follow = mysqlTable(
    "follow",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        follower_id: varchar("follower_id", { length: 191 }).notNull(),
        following_id: varchar("following_id", { length: 191 }).notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (follow) => ({
        followerIdIndex: index("follows__follower_id__idx").on(
            follow.follower_id,
        ),
        followingIdIndex: index("follows__following_id__idx").on(
            follow.following_id,
        ),
    }),
)
