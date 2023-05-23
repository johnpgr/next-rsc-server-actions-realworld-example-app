import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/lib/constants'
import { PageSearchParams, getSearchParams } from '~/lib/utils'
import { articlesService } from '~/services/articles'
import { authService } from '~/services/auth'

export const runtime = 'edge'

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: PageSearchParams
}) {
    const params = getSearchParams(searchParams, [
        'tag',
        'limit',
        'offset',
        'author',
        'favorited',
    ])

    const parsedParams = {
        limit:
            params.limit && !Number.isNaN(parseInt(params.limit))
                ? parseInt(params.limit)
                : 20,
        offset:
            params.offset && !Number.isNaN(parseInt(params.offset))
                ? parseInt(params.offset)
                : 0,
        tag: params.tag,
        authorName: params.author,
        favoritedBy: params.favorited,
    }

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
        params: parsedParams,
    })
    return <pre>{JSON.stringify(articles, null, 4)}</pre>
}
