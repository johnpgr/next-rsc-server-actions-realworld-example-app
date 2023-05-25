import { cookies } from "next/headers"
import { USER_TOKEN } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authService } from "~/modules/auth/auth.service"

export default async function ArticlePage({
    params,
}: {
    params: { slug: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const article = await articlesService.getArticleBySlug(
        params.slug,
        currentUser?.id,
    )

    return <pre>{JSON.stringify(article, null, 4)}</pre>
}
