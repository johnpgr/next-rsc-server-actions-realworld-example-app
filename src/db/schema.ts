import { relations, sql } from "drizzle-orm"

import { ProviderType } from "next-auth/providers"
import {
    sqliteTable,
    text,
    integer,
    primaryKey,
    index,
} from "drizzle-orm/sqlite-core"

// NextAuth
export const user = sqliteTable("user", {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    bio: text("bio"),
    image: text("image"),
    updated_at: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
})

export const account = sqliteTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        type: text("type").$type<ProviderType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compositePk: primaryKey(account.provider, account.providerAccountId),
    }),
)

export const session = sqliteTable("session", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationToken = sqliteTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    },
    (vt) => ({
        compositePk: primaryKey(vt.identifier, vt.token),
    }),
)
// End NextAuth

export const article = sqliteTable(
    "article",
    {
        id: text("id").notNull().primaryKey(),
        author_id: text("author_id").references(() => user.id),
        slug: text("slug").notNull(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        body: text("body").notNull(),
        updated_at: integer("updated_at", { mode: "timestamp" })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
    },
    (post) => ({
        userIdIndex: index("posts__user_id__idx").on(post.author_id),
    }),
)

export const userToArticlesRelation = relations(user, ({ many }) => ({
    articles: many(article),
}))

export const articleToUserRelation = relations(article, ({ one }) => ({
    user: one(user, {
        fields: [article.author_id],
        references: [user.id],
    }),
}))

export const tag = sqliteTable(
    "tag",
    {
        id: text("id").notNull().primaryKey(),
        name: text("name").notNull(),
        article_id: text("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
    },
    (tag) => ({
        articleIdIndex: index("tags__article_id__idx").on(tag.article_id),
    }),
)

export const articleToTagsRelation = relations(article, ({ many }) => ({
    tags: many(tag),
}))

export const tagToArticleRelation = relations(tag, ({ one }) => ({
    article: one(article, {
        fields: [tag.article_id],
        references: [article.id],
    }),
}))

export const comment = sqliteTable(
    "comment",
    {
        id: text("id").notNull().primaryKey(),
        author_id: text("author_id")
            .notNull()
            .references(() => user.id),
        article_id: text("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
        body: text("body").notNull(),
    },
    (comment) => ({
        userIdIndex: index("comments__user_id__idx").on(comment.author_id),
        articleIdIndex: index("comments__article_id__idx").on(
            comment.article_id,
        ),
    }),
)

export const userToCommentsRelation = relations(user, ({ many }) => ({
    comments: many(comment),
}))

export const articleToCommentsRelation = relations(article, ({ many }) => ({
    comments: many(comment),
}))

export const commentToUserRelation = relations(comment, ({ one }) => ({
    user: one(user, {
        fields: [comment.author_id],
        references: [user.id],
    }),
}))

export const commentToArticleRelation = relations(comment, ({ one }) => ({
    article: one(article, {
        fields: [comment.article_id],
        references: [article.id],
    }),
}))

export const favorite = sqliteTable(
    "favorite",
    {
        id: text("id").notNull().primaryKey(),
        user_id: text("user_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
        article_id: text("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
    },
    (favorite) => ({
        userIdIndex: index("favorites__user_id__idx").on(favorite.user_id),
        articleIdIndex: index("favorites__article_id__idx").on(
            favorite.article_id,
        ),
    }),
)

export const userToFavoritesRelation = relations(user, ({ many }) => ({
    favorites: many(favorite),
}))

export const articleToFavoritesRelation = relations(article, ({ many }) => ({
    favorites: many(favorite),
}))

export const favoriteToUserRelation = relations(favorite, ({ one }) => ({
    user: one(user, {
        fields: [favorite.user_id],
        references: [user.id],
    }),
}))

export const favoriteToArticleRelation = relations(favorite, ({ one }) => ({
    article: one(article, {
        fields: [favorite.article_id],
        references: [article.id],
    }),
}))

export const follow = sqliteTable(
    "follow",
    {
        id: text("id").notNull().primaryKey(),
        follower_id: text("follower_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
        following_id: text("following_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
    },
    (follow) => ({
        followerIndex: index("follows__follower_id__idx").on(
            follow.follower_id,
        ),
        followingIndex: index("follows__following_id__idx").on(
            follow.following_id,
        ),
    }),
)

export const userToFollowersRelation = relations(user, ({ many }) => ({
    followers: many(follow),
}))

export const userToFollowingRelation = relations(user, ({ many }) => ({
    following: many(follow),
}))
