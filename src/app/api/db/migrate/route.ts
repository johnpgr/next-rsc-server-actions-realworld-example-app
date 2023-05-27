import { migrate } from "drizzle-orm/libsql/migrator"
import { env } from "process"
import { db } from "~/db"
import { jsonResponse } from "~/utils/api"

export async function POST() {
    if (env.NODE_ENV !== "development") {
        return jsonResponse(403, { message: "Forbidden" })
    }
    try {
        await migrate(db, {
            migrationsFolder: "./src/db/migrations",
        })
        return jsonResponse(200, { message: "Migrations complete" })
    } catch (error) {
        console.error(error)
        return jsonResponse(500, { error: (error as Error).message })
    }
}
