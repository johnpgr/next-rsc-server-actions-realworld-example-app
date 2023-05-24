import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/config/constants'
import { PageSearchParams, getSearchParams } from '~/utils/search-params'
import { articlesService } from '~/modules/articles/articles.service'
import { authService } from '~/modules/auth/auth.service'

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

    const articles = await articlesService.getArticles({
        currentUserId: currentUser?.id ?? null,
        feedType: 'global',
        params: parsedParams,
    })
    return <pre>{JSON.stringify(articles, null, 4)}</pre>
}
