import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { articlesService } from "~/services/articles"
import { authService } from "~/services/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const token = req.headers.get("authorization")?.replace("Token ", "")

    const currentUser = token ? await authService.getPayloadFromToken(token) : null

    const article = await articlesService.getArticleBySlug(params.slug, currentUser?.id ?? "")

    return jsonResponse(200, { article })
}
