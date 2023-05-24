import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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