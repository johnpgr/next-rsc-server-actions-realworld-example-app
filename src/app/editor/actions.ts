'use server'

import { action } from '~/lib/actions'
import { authService } from '~/services/auth'
import {
    newArticleBodySchema,
    updateArticleBodySchema,
} from '../article/validations'
import { articlesService } from '~/services/articles'

export const publishArticleAction = action(
    { input: newArticleBodySchema, withAuth: true },
    async (data, { user }) => {
        if (!user)
            return {
                error: {
                    message: 'You need to be logged in to publish an article',
                    code: 401,
                },
            }

        const userId = await authService.getUserIdByUserName(user.username)

        const article = await articlesService.createArticle({
            body: data,
            userId,
        })

        if (!article)
            return {
                error: {
                    message: 'An article with the same slug already exists',
                    code: 409,
                },
            }

        return { article }
    },
)

export const editArticleAction = action(
    { input: updateArticleBodySchema, withAuth: true },
    async (data, { user }) => {
        if (!user) {
            return {
                error: {
                    message: 'You need to be logged in to edit an article',
                    code: 401,
                },
            }
        }

        const id = await authService.getUserIdByUserName(user.username)

        const isArticleAuthor = await articlesService.isArticleAuthor(
            id,
            data.slug,
        )

        if (!isArticleAuthor) {
            return {
                error: {
                    message: 'You are not the author of this article',
                    code: 403,
                },
            }
        }

        const article = await articlesService.updateArticle({
            slug: data.slug,
            body: data,
            userId: id,
        })

        return { article }
    },
)
