import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { GetArticlesParams, articlesService } from "~/services/articles"
import { authService } from "~/services/auth"

export const runtime = "edge"

export function getSearchParams(req: NextRequest): GetArticlesParams {
    const url = new URL(req.nextUrl)
    const tag = url.searchParams.get("tag")
    const authorName = url.searchParams.get("author")
    const favoritedBy = url.searchParams.get("favorited")
    const _limit = url.searchParams.get("limit")
    const _offset = url.searchParams.get("offset")

    const limit = _limit ? Number(_limit) : 20
    const offset = _offset ? Number(_offset) : 0

    return { tag, authorName, favoritedBy, limit, offset }
}

export async function GET(req: NextRequest) {
    const params = getSearchParams(req)
    const token = req.headers.get("authorization")?.replace("Token ", "")
    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null
    const currentUserId = currentUser?.id ?? null

    const articles = await articlesService.getArticles(params, currentUserId)

    return jsonResponse(200, { articles, articlesCount: articles.length })
}
