import { and, eq, sql } from "drizzle-orm"
import { db } from "~/db"
import * as schema from "~/db/schema"
import { articlesService } from "../articles/articles.service"
import { type ArticleModel } from "../articles/articles.types"
import { Favorite } from "./favorites.types"
import { createId } from "~/utils/id"

class FavoritesService {
    private database: typeof db

    constructor(database: typeof db) {
        this.database = database
    }

    /**
     * @throws {Error}
     */
    async favoriteArticle(args: {
        articleId: string
        userId: string
    }): Promise<Favorite | null> {
        const { articleId, userId } = args

        const favorite = await this.database
            .insert(schema.favorite)
            .values({
                id: createId(),
                article_id: articleId,
                user_id: userId,
            })
            .returning()
            .get()

        return favorite
    }
    /**
     * @throws {Error}
     */
    async unfavoriteArticle(args: {
        articleId: string
        userId: string
    }): Promise<Favorite | null> {
        const { articleId, userId } = args

        const favorite = await this.database
            .delete(schema.favorite)
            .where(
                and(
                    eq(schema.favorite.article_id, articleId),
                    eq(schema.favorite.user_id, userId),
                ),
            )
            .returning()
            .get()

        if (!favorite) {
            throw new Error("Favorite not found")
        }

        return favorite
    }

    async userHasFavoritedArticle(args: {
        articleId: string
        userId: string
    }): Promise<boolean> {
        const { articleId, userId } = args

        const found = await this.database
            .select({ exist: sql`1` })
            .from(schema.favorite)
            .where(
                and(
                    eq(schema.favorite.article_id, articleId),
                    eq(schema.favorite.user_id, userId),
                ),
            )
            .get()

        return Boolean(found)
    }
}

export const favoritesService = new FavoritesService(db)
