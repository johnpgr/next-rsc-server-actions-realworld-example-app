'use server'
import { action } from '~/lib/actions'
import {
    newArticleBodySchema,
    updateArticleBodySchema,
} from './articles.validations'
import { articlesService } from './articles.service'

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

        const article = await articlesService.createArticle(data, user.id)

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

        const isArticleAuthor = await articlesService.isArticleAuthor(
            user.id,
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

        const article = await articlesService.updateArticle(data, user.id)

        return { article }
    },
)
