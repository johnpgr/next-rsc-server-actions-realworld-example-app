import { and, eq } from 'drizzle-orm'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db/drizzle-db'
import { favorite } from '~/db/schema'
import { createId } from '~/lib/utils'

class FavoritesService {
    private db: PlanetScaleDatabase

    constructor(db: PlanetScaleDatabase) {
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

        const { rowsAffected } = await this.db.insert(favorite).values({
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
            .delete(favorite)
            .where(
                and(
                    eq(favorite.article_id, articleId),
                    eq(favorite.user_id, userId),
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
            .select({ id: favorite.id })
            .from(favorite)
            .where(
                and(
                    eq(favorite.article_id, articleId),
                    eq(favorite.user_id, userId),
                ),
            )

        return found.length === 1
    }
}

export const favoritesService = new FavoritesService(db)
