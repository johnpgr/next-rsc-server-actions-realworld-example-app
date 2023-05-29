"use server"
import { action } from "~/utils/actions"
import { createCommentSchema, deleteCommentSchema } from "./comments.validation"
import { commentsService } from "./comments.service"
import { revalidatePath } from "next/cache"

export const createCommentAction = action(
    {
        input: createCommentSchema,
    },
    async (data) => {
        if (!data.session?.user) {
            return {
                error: {
                    message: "You must be logged in to comment",
                    code: 401,
                },
            }
        }

        const comment = await commentsService.createComment({
            body: data.body,
            authorId: data.session.user.id,
            articleSlug: data.article.slug,
        })

        revalidatePath(`/article/${data.article.slug}`)
        return { comment }
    },
)

export const deleteCommentAction = action(
    {
        input: deleteCommentSchema,
    },
    async (data) => {
        if (!data.session?.user) {
            return {
                error: {
                    message: "You must be logged in to delete a comment",
                    code: 401,
                },
            }
        }

        const comment = await commentsService.deleteComment({
            commentId: data.id,
            userId: data.session.user.id,
        })

        return { comment }
    },
)
