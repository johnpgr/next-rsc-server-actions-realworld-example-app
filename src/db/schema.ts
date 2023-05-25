import { relations } from "drizzle-orm"
import {
    index,
    pgTable,
    timestamp,
    varchar,
    text,
    uuid,
    primaryKey,
    integer,
} from "drizzle-orm/pg-core"
import { ProviderType } from "next-auth/providers"

// NextAuth
export const user = pgTable(
    "user",
    {
        id: uuid("id").notNull().defaultRandom(),
        name: varchar("name", { length: 191 }),
        email: varchar("email", { length: 191 }).notNull(),
        emailVerified: timestamp("emailVerified"),
        image: varchar("image", { length: 191 }),
    },
    (user) => ({
        compositePk: primaryKey(user.id, user.email),
    }),
)

export const userToAccountsRelation = relations(user, ({ many }) => ({
    accounts: many(account),
    sessions: many(session),
}))

export const account = pgTable(
    "account",
    {
        id: uuid("id").notNull().defaultRandom(),
        userId: uuid("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        type: varchar("type", { length: 191 }).$type<ProviderType>().notNull(),
        provider: varchar("provider", { length: 191 }).notNull(),
        providerAccountId: varchar("providerAccountId", {
            length: 191,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: varchar("token_type", { length: 191 }),
        scope: varchar("scope", { length: 191 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 191 }),
    },
    (account) => ({
        compositePk: primaryKey(
            account.id,
            account.provider,
            account.providerAccountId,
        ),
    }),
)

export const accountsToUserRelation = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}))

export const session = pgTable(
    "session",
    {
        id: uuid("id").notNull().defaultRandom(),
        sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
        userId: uuid("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        expires: timestamp("expires").notNull(),
    },
    (session) => ({
        compositePk: primaryKey(session.id, session.sessionToken),
    }),
)

export const sessionsToUserRelation = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}))

export const verificationToken = pgTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 191 }).notNull(),
        token: varchar("token", { length: 191 }).notNull(),
        expires: timestamp("expires").notNull(),
    },
    (vt) => ({
        compositePk: primaryKey(vt.identifier, vt.token),
    }),
)
// End NextAuth

export const article = pgTable(
    "article",
    {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        author_id: varchar("author_id", { length: 191 }).notNull(),
        slug: varchar("slug", { length: 191 }).notNull(),
        title: varchar("title", { length: 191 }).notNull(),
        description: varchar("description", { length: 191 }).notNull(),
        body: text("body").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
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

export const tag = pgTable(
    "tag",
    {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        name: varchar("name", { length: 191 }).notNull(),
        article_id: uuid("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at").defaultNow().notNull(),
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

export const comment = pgTable(
    "comment",
    {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        author_id: uuid("author_id")
            .notNull()
            .references(() => user.id),
        article_id: uuid("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
        body: text("body").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
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

export const favorite = pgTable(
    "favorite",
    {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        user_id: uuid("user_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
        article_id: uuid("article_id")
            .notNull()
            .references(() => article.id, {
                onDelete: "cascade",
            }),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
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

export const follow = pgTable(
    "follow",
    {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        follower_id: uuid("follower_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
        following_id: uuid("following_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
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
