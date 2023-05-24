import { and, eq } from 'drizzle-orm'
import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { db } from '~/db'
import {schema} from '~/db/schema'
import { createId } from '~/utils/ulid'
import { articlesService } from '../articles/articles.service'
import { type ParsedArticleQueryResponse } from '../articles/articles.types' 

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
    }): Promise<ParsedArticleQueryResponse | null> {
        const { articleId, userId } = args

        const { rowsAffected } = await this.db.insert(schema.favorite).values({
            id: createId(),
            article_id: articleId,
            user_id: userId,
        })

        if (rowsAffected !== 1) {
            throw new Error('Failed to favorite article')
        }

        const [{ slug }] = await this.db
            .select({ slug: schema.article.slug })
            .from(schema.article)
            .where(eq(schema.article.id, articleId))
            .limit(1)

        if (!slug) throw new Error('Failed to get article slug')

        return await articlesService.getArticleBySlug(slug, userId)
    }
    /**
     * @throws {Error}
     */
    async unfavoriteArticle(args: {
        articleId: string
        userId: string
    }): Promise<ParsedArticleQueryResponse | null> {
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

        const [{ slug }] = await this.db
            .select({ slug: schema.article.slug })
            .from(schema.article)
            .where(eq(schema.article.id, articleId))
            .limit(1)

        if (!slug) throw new Error('Failed to get article slug')

        return await articlesService.getArticleBySlug(slug, userId)
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
