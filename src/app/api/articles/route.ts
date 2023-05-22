import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { GetArticlesParams, articlesService } from "~/services/articles"
import { authService } from "~/services/auth"
import { newArticleBodySchema } from "./validation"

export const runtime = "edge"

function getSearchParams(req: NextRequest): GetArticlesParams {
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

    const currentUserId = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    const articles = await articlesService.getArticles({
        currentUserId,
        feedType: "global",
        params,
    })

    return jsonResponse(200, { articles, articlesCount: articles.length })
}

export async function POST(req: NextRequest) {
    const token = req.headers.get("authorization")?.replace("Token ", "")
    if (!token) return jsonResponse(401, { errors: { body: ["Unauthorized"] } })

    const currentUser = await authService.getPayloadFromToken(token)

    if (!currentUser)
        return jsonResponse(401, { errors: { body: ["Unauthorized"] } })
    
    const userId = await authService.getUserIdByUserName(currentUser.username)

    const body = await req.json()

    const parsed = newArticleBodySchema.safeParse(body)

    if (!parsed.success)
        return jsonResponse(422, { errors: { body: [parsed.error.format()] } })

    const article = await articlesService.createArticle({
        body: parsed.data,
        userId
    })

    if (!article)
        return jsonResponse(422, {
            errors: { body: ["An article with the same slug already exists"] },
        })

    return jsonResponse(201, { article })
}
