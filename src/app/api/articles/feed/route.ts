import { NextRequest } from "next/server"
import { errorBody, jsonResponse } from "~/lib/utils"
import { articlesService } from "~/services/articles"
import { authService } from "~/services/auth"

export const runtime = "edge"

function getSearchParams(req: NextRequest) {
    const url = new URL(req.nextUrl)
    const _limit = url.searchParams.get("limit")
    const _offset = url.searchParams.get("offset")
    const limit = _limit ? Number(_limit) : 20
    const offset = _offset ? Number(_offset) : 0

    return {
        limit,
        offset,
        tag: null,
        authorName: null,
        favoritedBy: null,
    }
}

export async function GET(req: NextRequest) {
    const params = getSearchParams(req)

    const token = req.headers.get("authorization")?.replace("Token ", "")

    if (!token) return jsonResponse(401, errorBody(["Unauthorized"]))

    const currentUser = await authService.getPayloadFromToken(token)

    if (!currentUser) return jsonResponse(401, errorBody(["Token Expired"]))

    const currentUserId = await authService.getUserIdByUserName(
        currentUser.username,
    )

    const articles = await articlesService.getArticles({
        currentUserId,
        params,
        feedType: "user"
    })

    return jsonResponse(200, { articles, articlesCount: articles.length })
}
