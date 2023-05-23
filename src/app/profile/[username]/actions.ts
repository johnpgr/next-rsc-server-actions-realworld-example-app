'use server'
import { action } from '~/lib/actions'
import { favoriteArticleSchema } from './validation'
import { authService } from '~/services/auth'
import { articlesService } from '~/services/articles'
import { favoritesService } from '~/services/favorites'

export const favoriteArticleAction = action(
    {
        input: favoriteArticleSchema,
        withAuth: true,
    },
    async (data, { user }) => {
        if (!user)
            return {
                error: {
                    message: 'You must be logged in to favorite an article.',
                    code: 403,
                },
            }

        const { slug } = data.article
        const { username } = user

        const userId = await authService.getUserIdByUserName(username)
        const articleId = await articlesService.getArticleIdBySlug(slug)

        if (!articleId)
            return {
                error: {
                    message: 'Article not found.',
                    code: 404,
                },
            }

        const favorited = await favoritesService.userHasFavoritedArticle({
            articleId,
            userId,
        })

        if (favorited)
            return {
                error: {
                    message: 'Article already favorited.',
                    code: 403,
                },
            }

        await favoritesService.favoriteArticle({
            articleId,
            userId,
        })

        return { articleId }
    },
)

export const unfavoriteArticleAction = action(
    {
        input: favoriteArticleSchema,
        withAuth: true,
    },
    async (data, { user }) => {
        if (!user)
            return {
                error: {
                    message: 'You must be logged in to favorite an article.',
                    code: 403,
                },
            }

        const { slug } = data.article
        const { username } = user

        const userId = await authService.getUserIdByUserName(username)
        const articleId = await articlesService.getArticleIdBySlug(slug)

        if (!articleId)
            return {
                error: {
                    message: 'Article not found.',
                    code: 404,
                },
            }

        const favorited = await favoritesService.userHasFavoritedArticle({
            articleId,
            userId,
        })

        if (!favorited)
            return {
                error: {
                    message: 'Article not favorited.',
                    code: 403,
                },
            }

        await favoritesService.unfavoriteArticle({
            articleId,
            userId,
        })

        return { articleId }
    }
)
