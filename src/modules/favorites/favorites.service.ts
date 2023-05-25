import { and, eq } from "drizzle-orm"
import { db } from "~/db"
import * as schema from "~/db/schema"
import { articlesService } from "../articles/articles.service"
import { type ArticleModel } from "../articles/articles.types"
import { Favorite } from "./favorites.types"

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

        const [favorite] = await this.database
            .insert(schema.favorite)
            .values({
                article_id: articleId,
                user_id: userId,
            })
            .returning()

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

        const [favorite] = await this.database
            .delete(schema.favorite)
            .where(
                and(
                    eq(schema.favorite.article_id, articleId),
                    eq(schema.favorite.user_id, userId),
                ),
            )
            .returning()

        return favorite
    }

    async userHasFavoritedArticle(args: {
        articleId: string
        userId: string
    }): Promise<boolean> {
        const { articleId, userId } = args

        const found = await this.database
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
