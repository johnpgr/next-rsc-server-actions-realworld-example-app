import { and, eq } from 'drizzle-orm'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db/drizzle-db'
import * as schema from '~/db/schema'
import { createId } from '~/lib/utils'

class FavoritesService {
    private db: PlanetScaleDatabase<typeof schema>

    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    /**
     * @throws {Error}
     */
    async favoriteArticle(args: {
        articleId: string
        userId: string
    }): Promise<void> {
        const { articleId, userId } = args

        const { rowsAffected } = await this.db.insert(schema.favorite).values({
            id: createId(),
            article_id: articleId,
            user_id: userId,
        })

        if (rowsAffected !== 1) {
            throw new Error('Failed to favorite article')
        }
    }
    /**
     * @throws {Error}
     */
    async unfavoriteArticle(args: {
        articleId: string
        userId: string
    }): Promise<void> {
        const { articleId, userId } = args

        const { rowsAffected } = await this.db
            .delete(schema.favorite)
            .where(
                and(
                    eq(schema.favorite.article_id, articleId),
                    eq(schema.favorite.user_id, userId),
                ),
            )

        if (rowsAffected !== 1) {
            throw new Error('Failed to unfavorite article')
        }
    }

    async userHasFavoritedArticle(args: {
        articleId: string
        userId: string
    }): Promise<boolean> {
        const { articleId, userId } = args

        const found = await this.db
            .select({ id: schema.favorite.id })
            .from(schema.favorite)
            .where(
                and(
                    eq(schema.favorite.article_id, articleId),
                    eq(schema.favorite.user_id, userId),
                ),
            )

        return found.length === 1
    }
}

export const favoritesService = new FavoritesService(db)
