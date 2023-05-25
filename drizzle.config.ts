import "dotenv/config"
import type { Config } from "drizzle-kit"

const config: Config = {
    schema: "./src/db/schema.ts",
    connectionString: process.env.DB_URL,
    out: "./src/db/migrations/",
}

export default config
