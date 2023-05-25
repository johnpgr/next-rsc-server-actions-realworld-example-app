import { migrate } from "drizzle-orm/neon-serverless/migrator"
import { env } from "~/config/env.mjs"
import { db } from "~/db"
import { jsonResponse } from "~/utils/api"

export const runtime = "nodejs"

export async function GET() {
    if (env.NODE_ENV !== "development")
        return jsonResponse(403, { error: "Forbidden" })

    try {
        await migrate(db, {
            migrationsFolder: "./src/db/migrations/",
        })
        return jsonResponse(200, { message: "Migrations complete" })
    } catch (error) {
        return jsonResponse(500, { error: (error as Error).message })
    }
}
