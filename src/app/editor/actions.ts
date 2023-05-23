'use server'

import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/lib/constants'
import { action } from '~/lib/utils'
import { authService } from '~/services/auth'
import { newArticleBodySchema } from '../article/validations'
import { articlesService } from '~/services/articles'

export const publishArticleAction = action(
    { input: newArticleBodySchema, withAuth: true },
    async (
        data,
    ) => {
        const token = cookies().get(USER_TOKEN)?.value

        if (!token)
            return {
                error: {
                    message: 'You need to be logged in to publish an article',
                    code: 401,
                },
            }

        const currentUser = await authService.getPayloadFromToken(token)

        if (!currentUser)
            return {
                error: {
                    message: 'Your session has expired, please log in again',
                    code: 401,
                },
            }

        const userId = await authService.getUserIdByUserName(
            currentUser.username,
        )

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
