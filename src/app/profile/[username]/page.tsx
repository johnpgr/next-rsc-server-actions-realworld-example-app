import { cookies } from 'next/headers'
import { ArticleRow } from '~/components/article-row'
import { USER_TOKEN } from '~/lib/constants'
import { articlesService } from '~/services/articles'
import { authService } from '~/services/auth'

export const runtime = 'edge'

export default async function UserArticlesPage({
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
            authorName: params.username,
            tag: null,
            limit: 6,
            offset: 0,
            favoritedBy: null,
        },
    })

    return (
        <ul className='divide-y'>
            {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
            ))}
        </ul>
    )
}
