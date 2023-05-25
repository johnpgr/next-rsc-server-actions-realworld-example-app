"use server"
import { action } from "~/utils/actions"
import { favoriteArticleSchema } from "./favorites.validation"
import { favoritesService } from "./favorites.service"
import { articlesService } from "../articles/articles.service"
import { revalidatePath } from "next/cache"
import { usersService } from "../users/users.service"

export const favoriteArticleAction = action(
    {
        input: favoriteArticleSchema,
        withAuth: true,
    },
    async (data, { session }) => {
        if (!session || !session.user)
            return {
                error: {
                    message: "You must be logged in to favorite an article",
                    code: 403,
                },
            }

        const articleId = await articlesService.getArticleIdBySlug(
            data.article.slug,
        )

        if (!articleId)
            return {
                error: {
                    message: "Article not found",
                    code: 404,
                },
            }

        const isFavorited = await favoritesService.userHasFavoritedArticle({
            articleId,
            userId: session.user.id,
        })

        if (isFavorited)
            return {
                error: {
                    message: "Article already favorited",
                    code: 403,
                },
            }

        const res = await favoritesService.favoriteArticle({
            articleId,
            userId: session.user.id,
        })

        if (!res)
            return {
                error: {
                    message: "Failed to favorite article",
                    code: 500,
                },
            }
        const article = await articlesService.getArticleById(res.article_id)
        if (!article)
            return {
                error: {
                    message: "Failed to revalidate",
                    code: 500,
                },
            }

        revalidatePath(`/profile/${article.author.username}`)

        return { article }
    },
)

export const unfavoriteArticleAction = action(
    {
        input: favoriteArticleSchema,
        withAuth: true,
    },
    async (data, { session }) => {
        if (!session || !session.user)
            return {
                error: {
                    message: "You must be logged in to favorite an article",
                    code: 403,
                },
            }

        const articleId = await articlesService.getArticleIdBySlug(
            data.article.slug,
        )

        if (!articleId)
            return {
                error: {
                    message: "Article not found",
                    code: 404,
                },
            }

        const isFavorited = await favoritesService.userHasFavoritedArticle({
            articleId,
            userId: session.user.id,
        })

        if (!isFavorited)
            return {
                error: {
                    message: "Article not favorited",
                    code: 403,
                },
            }

        const res = await favoritesService.unfavoriteArticle({
            articleId,
            userId: session.user.id,
        })

        if (!res)
            return {
                error: {
                    message: "Failed to unfavorite article",
                    code: 500,
                },
            }

        const article = await articlesService.getArticleById(res.article_id)

        if (!article)
            return {
                error: {
                    message: "Failed to revalidate",
                    code: 500,
                },
            }

        revalidatePath(`/profile/${article.author.username}`)

        return { article }
    },
)
