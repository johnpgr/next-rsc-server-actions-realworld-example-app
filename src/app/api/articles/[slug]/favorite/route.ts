import { NextRequest } from "next/server"
import { errorBody, jsonResponse } from "~/lib/utils"
import { articlesService } from "~/services/articles"
import { authService } from "~/services/auth"
import { favoritesService } from "~/services/favorites"

export async function POST(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get("authorization")?.replace("Token ", "")

    if (!token) {
        return jsonResponse(401, errorBody(["Unauthorized"]))
    }

    const currentUser = await authService.getPayloadFromToken(token)

    if (!currentUser) {
        return jsonResponse(401, errorBody(["Token Expired"]))
    }

    const currentUserId = await authService.getUserIdByUserName(
        currentUser.username,
    )

    const articleId = await articlesService.getArticleIdBySlug(params.slug)

    if (!articleId) {
        return jsonResponse(404, errorBody(["Article not found"]))
    }

    await favoritesService.favoriteArticle({
        articleId,
        userId: currentUserId,
    })

    const article = await articlesService.getArticleBySlug(
        params.slug,
        currentUserId,
    )

    return jsonResponse(200, { article })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get("authorization")?.replace("Token ", "")

    if (!token) {
        return jsonResponse(401, errorBody(["Unauthorized"]))
    }

    const currentUser = await authService.getPayloadFromToken(token)

    if (!currentUser) {
        return jsonResponse(401, errorBody(["Token Expired"]))
    }

    const currentUserId = await authService.getUserIdByUserName(
        currentUser.username,
    )

    const articleId = await articlesService.getArticleIdBySlug(params.slug)

    if (!articleId) {
        return jsonResponse(404, errorBody(["Article not found"]))
    }

    const userHasFavoritedArticle =
        await favoritesService.userHasFavoritedArticle({
            articleId,
            userId: currentUserId,
        })

    if (!userHasFavoritedArticle) {
        return jsonResponse(
            400,
            errorBody(["Invalid Request", "Article not favorited"]),
        )
    }

    await favoritesService.unfavoriteArticle({
        articleId,
        userId: currentUserId,
    })

    const article = await articlesService.getArticleBySlug(
        params.slug,
        currentUserId,
    )

    if (!article) {
        return jsonResponse(404, errorBody(["Article not found"]))
    }

    return jsonResponse(200, { article })
}
