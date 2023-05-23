import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/lib/constants'
import { articlesService } from '~/services/articles'
import { authService } from '~/services/auth'

export default async function FavoritesPage({
    params,
}: {
    params: { username: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const currentUserId = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    const articles = await articlesService.getArticles({
        currentUserId,
        feedType: 'global',
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
