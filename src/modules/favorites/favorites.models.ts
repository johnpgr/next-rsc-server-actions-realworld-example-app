import { index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

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