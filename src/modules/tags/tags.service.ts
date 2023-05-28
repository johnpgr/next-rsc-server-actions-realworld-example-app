import { desc, eq, sql } from "drizzle-orm"
import { db } from "~/db"
import * as schema from "~/db/schema"

class TagsService {
    private database: typeof db
    constructor(database: typeof db) {
        this.database = database
    }

    async getPopularTags(): Promise<string[]> {
        const favoritesSq = this.database
            .select({
                id: schema.favorite.article_id,
                favoritesCount: sql<number>`count(*)`.as("favoritesCount"),
            })
            .from(schema.favorite)
            .groupBy(schema.favorite.article_id)
            .as("f")

        const tags = await this.database
            .select({
                name: schema.tag.name,
            })
            .from(schema.tag)
            .leftJoin(favoritesSq, eq(schema.tag.article_id, favoritesSq.id))
            .orderBy(desc(sql`coalesce(${favoritesSq.favoritesCount}, 0)`))
            .limit(10)
            .all()
        return tags.map((tag) => tag.name)
    }
}

export const tagsService = new TagsService(db)
