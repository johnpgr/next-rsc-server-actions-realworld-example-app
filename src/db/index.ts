import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"
import { env } from "~/config/env.mjs"
import { migrate as libsqlMigrate } from "drizzle-orm/libsql/migrator"

const client = createClient({
    url: env.DB_URL,
    authToken: env.DB_TOKEN,
})

export const db = drizzle(client, {
    logger: env.NODE_ENV === "development" ? true : false,
    schema,
})

async function migrate() {
    try {
        await libsqlMigrate(db, {
            migrationsFolder: "./src/db/migrations",
        })
        console.log("Migrations complete")
    } catch (error) {
        console.error(error)
    }
}

if (env.NODE_ENV === "production") {
    migrate()
}
