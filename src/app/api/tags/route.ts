import { NextRequest } from "next/server"
import { db } from "~/db/drizzle-db"
import { tag } from "~/db/schema"
import { jsonResponse } from "~/lib/utils"

export async function GET() {
    const tags = await db
        .select({
            name: tag.name,
        })
        .from(tag)

    return jsonResponse(200, { tags: tags.map((t) => t.name) })
}
