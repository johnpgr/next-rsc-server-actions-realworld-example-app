import { index, mysqlTable, timestamp, varchar,text } from "drizzle-orm/mysql-core";

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

export const password = mysqlTable('password', {
    id: varchar('id', { length: 191 }).primaryKey().notNull(),
    password: text('password').notNull(),
    salt: text('salt').notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
})