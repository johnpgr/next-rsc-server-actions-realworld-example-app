import { cookies } from "next/headers"
import { USER_TOKEN } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authService } from "~/modules/auth/auth.service"

export default async function FavoritesPage({
    params,
}: {
    params: { username: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const articles = await articlesService.getArticles({
        currentUserId: currentUser?.id ?? null,
        feedType: "global",
        params: {
            authorName: null,
            tag: null,
            limit: 6,
            offset: 0,
            favoritedBy: params.username,
        },
    })
    return <pre>{JSON.stringify(articles, null, 4)}</pre>
}
