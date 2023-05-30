import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"
import { env } from "../config/env"

const client = createClient({
    url: env.DB_URL,
    authToken: env.DB_TOKEN,
})

export const db = drizzle(client, {
    logger: env.DB_LOGGER,
    schema,
})
