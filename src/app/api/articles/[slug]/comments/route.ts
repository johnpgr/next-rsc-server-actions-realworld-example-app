import { NextRequest } from 'next/server'
import { errorBody, jsonResponse } from '~/lib/utils'
import { authService } from '~/services/auth'
import { createCommentBodySchema } from './validation'
import { commentsService } from '~/services/comments'
import { articlesService } from '~/services/articles'

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get('authorization')?.replace('Token ', '')

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const currentUserId = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    const articleId = await articlesService.getArticleIdBySlug(params.slug)

    if (!articleId) {
        return jsonResponse(404, errorBody(['Article not found']))
    }

    const comments = await commentsService.getCommentsFromArticleId(
        articleId,
        currentUserId,
    )

    return jsonResponse(200, { comments })
}

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: { slug: string }
    },
) {
    const token = req.headers.get('authorization')?.replace('Token ', '')

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    if (!currentUser) {
        return jsonResponse(401, errorBody(['Unauthorized']))
    }

    const body = await req.json()
    const parsed = createCommentBodySchema.safeParse(body)

    if (!parsed.success) {
        return jsonResponse(
            422,
            errorBody(parsed.error.issues.map((issue) => issue.message)),
        )
    }

    const articleId = await articlesService.getArticleIdBySlug(params.slug)

    if (!articleId) {
        return jsonResponse(404, errorBody(['Article not found']))
    }

    const authorId = await authService.getUserIdByUserName(currentUser.username)

    await commentsService.createComment({
        authorId,
        articleId,
        input: parsed.data,
    })

    return jsonResponse(201, { ok: true })
}
