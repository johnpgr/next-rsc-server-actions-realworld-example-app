import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
// import { migrate } from "drizzle-orm/neon-serverless/migrator"
import * as schema from "./schema"
import { env } from "~/config/env.mjs"

const pool = new Pool({ connectionString: env.DB_URL })

export const db = drizzle(pool, {
    logger: env.NODE_ENV === "development" ? true : false,
    schema,
})

// migrate(db, {
//     migrationsFolder: "./src/db/migrations",
// })
