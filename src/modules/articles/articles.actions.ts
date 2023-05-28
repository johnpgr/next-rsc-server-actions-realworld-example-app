"use server"
import { action } from "~/utils/actions"
import {
    newArticleBodySchema,
    updateArticleBodySchema,
} from "./articles.validations"
import { articlesService } from "./articles.service"

export const publishArticleAction = action(
    { input: newArticleBodySchema },
    async (data) => {
        const { session } = data

        if (!session?.user)
            return {
                error: {
                    message: "You need to be logged in to publish an article",
                    code: 401,
                },
            }

        const article = await articlesService.create(data, session.user.id)

        if (!article)
            return {
                error: {
                    message: "An article with the same slug already exists",
                    code: 409,
                },
            }

        return { article }
    },
)

export const editArticleAction = action(
    { input: updateArticleBodySchema, withAuth: true },
    async (data) => {
        const { session } = data

        if (!session?.user) {
            return {
                error: {
                    message: "You need to be logged in to edit an article",
                    code: 401,
                },
            }
        }

        const isArticleAuthor = await articlesService.isAuthor(
            session.user.id,
            data.slug,
        )

        if (!isArticleAuthor) {
            return {
                error: {
                    message: "You are not the author of this article",
                    code: 403,
                },
            }
        }

        const article = await articlesService.update(data)

        return { article }
    },
)
