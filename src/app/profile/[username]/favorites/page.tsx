import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { USER_TOKEN } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"

export default async function FavoritesPage({
    params,
}: {
    params: { username: string }
}) {
    const session = await getServerSession(authOptions)
    const articles = await articlesService.getArticles({
        currentUserId: session?.user?.id ?? null,
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
