import { NextRequest } from "next/server"
import { errorBody, jsonResponse } from "~/lib/utils"
import { articlesService } from "~/services/articles"
import { authService } from "~/services/auth"
import { updateArticleBodySchema } from "../validation"

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get("authorization")?.replace("Token ", "")

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const id = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    const article = await articlesService.getArticleBySlug(params.slug, id)

    return jsonResponse(200, { article })
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get("authorization")?.replace("Token ", "")

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    if (!currentUser) {
        return jsonResponse(401, errorBody(["Unauthorized"]))
    }

    const body = await req.json()
    const parsed = updateArticleBodySchema.safeParse(body)

    if (!parsed.success) {
        return jsonResponse(
            422,
            errorBody(parsed.error.issues.map((issue) => issue.message)),
        )
    }

    const id = await authService.getUserIdByUserName(currentUser.username)

    const isArticleAuthor = await articlesService.isArticleAuthor(
        id,
        params.slug,
    )

    if (!isArticleAuthor) {
        return jsonResponse(403, errorBody(["Forbidden"]))
    }

    const article = await articlesService.updateArticle({
        slug: params.slug,
        body: parsed.data,
        userId: id,
    })

    return jsonResponse(200, { article })
}
