import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"
import { env } from "~/config/env.mjs"

const client = createClient({
    url: env.DB_URL,
    authToken: env.DB_TOKEN,
})

export const db = drizzle(client, {
    logger: env.NODE_ENV === "development" ? true : false,
    schema,
})
