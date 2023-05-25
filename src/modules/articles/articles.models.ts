import {
    index,
    mysqlTable,
    timestamp,
    varchar,
    text,
} from "drizzle-orm/mysql-core"

export const article = mysqlTable(
    "article",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        author_id: varchar("author_id", { length: 191 }).notNull(),
        slug: varchar("slug", { length: 191 }).notNull(),
        title: varchar("title", { length: 191 }).notNull(),
        description: varchar("description", { length: 191 }).notNull(),
        body: text("body").notNull(),
        updated_at: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .onUpdateNow(),
    },
    (post) => ({
        userIdIndex: index("posts__user_id__idx").on(post.author_id),
    }),
)

export const tag = mysqlTable(
    "tag",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        name: varchar("name", { length: 191 }).notNull(),
        article_id: varchar("article_id", { length: 191 }).notNull(),
        updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
    },
    (tag) => ({
        articleIdIndex: index("tags__article_id__idx").on(tag.article_id),
    }),
)
