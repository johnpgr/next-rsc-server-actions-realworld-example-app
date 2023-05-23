import { InferModel } from 'drizzle-orm'
import {
    datetime,
    index,
    int,
    mysqlTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core'

export const user = mysqlTable(
    'user',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        username: varchar('name', { length: 191 }).notNull(),
        email: varchar('email', { length: 191 }).notNull(),
        password_id: varchar('password_id', { length: 191 }).notNull(),
        image: varchar('image', { length: 191 }),
        bio: text('bio'),
        updated_at: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (user) => ({
        passwordIdIndex: index('users__password_id__idx').on(user.password_id),
    }),
)

export type User = InferModel<typeof user>

export const password = mysqlTable('password', {
    id: varchar('id', { length: 191 }).primaryKey().notNull(),
    password: text('password').notNull(),
    salt: text('salt').notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export type Password = InferModel<typeof password>
export type NewPassword = InferModel<typeof password, 'insert'>

export const article = mysqlTable(
    'article',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        author_id: varchar('author_id', { length: 191 }).notNull(),
        slug: varchar('slug', { length: 191 }).notNull(),
        title: varchar('title', { length: 191 }).notNull(),
        description: varchar('description', { length: 191 }).notNull(),
        body: text('body').notNull(),
        updated_at: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (post) => ({
        userIdIndex: index('posts__user_id__idx').on(post.author_id),
    }),
)

export type Article = InferModel<typeof article>
export type NewArticle = InferModel<typeof article, 'insert'>

export const tag = mysqlTable(
    'tag',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        name: varchar('name', { length: 191 }).notNull(),
        article_id: varchar('article_id', { length: 191 }).notNull(),
        updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (tag) => ({
        articleIdIndex: index('tags__article_id__idx').on(tag.article_id),
    }),
)

export const favorite = mysqlTable(
    'favorite',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        user_id: varchar('user_id', { length: 191 }).notNull(),
        article_id: varchar('article_id', { length: 191 }).notNull(),
        updated_at: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (favorite) => ({
        userIdIndex: index('favorites__user_id__idx').on(favorite.user_id),
        articleIdIndex: index('favorites__article_id__idx').on(
            favorite.article_id,
        ),
    }),
)

export const comment = mysqlTable(
    'comment',
    {
        id: varchar('id', { length: 191 }).primaryKey().notNull(),
        author_id: varchar('author_id', { length: 191 }).notNull(),
        article_id: varchar('article_id', { length: 191 }).notNull(),
        body: text('body').notNull(),
        updated_at: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (comment) => ({
        userIdIndex: index('comments__user_id__idx').on(comment.author_id),
        articleIdIndex: index('comments__article_id__idx').on(
            comment.article_id,
        ),
    }),
)

export type Comment = InferModel<typeof comment>
export type NewComment = InferModel<typeof comment, 'insert'>

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
