import { NextRequest } from 'next/server'
import { errorBody, jsonResponse } from '~/lib/utils'
import { authService } from '~/services/auth'
import { commentsService } from '~/services/comments'

export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string; id: string } },
) {
    const token = req.headers.get('authorization')?.replace('Token ', '')

    if (!token) {
        return jsonResponse(401, errorBody(['Unauthorized']))
    }

    const currentUser = await authService.getPayloadFromToken(token)

    if (!currentUser) {
        return jsonResponse(401, errorBody(['Token Expired']))
    }

    const currentUserId = await authService.getUserIdByUserName(
        currentUser.username,
    )

    const isCommentAuthor = await commentsService.isCommentAuthor({
        commentId: params.id,
        userId: currentUserId,
    })

    if (!isCommentAuthor) {
        return jsonResponse(403, errorBody(['Forbidden']))
    }

    await commentsService.deleteComment({
        commentId: params.id,
        userId: currentUserId,
    })

    return jsonResponse(200, { ok: true })
}
