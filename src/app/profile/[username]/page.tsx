import { cookies } from 'next/headers'
import { ArticleRow } from '~/components/articles/article-row'
import { USER_TOKEN } from '~/config/constants'
import { articlesService } from '~/modules/articles/articles.service'
import { unstable_cache as cache } from 'next/cache'
import { authService } from '~/modules/auth/auth.service'

export const runtime = 'nodejs'

export default async function UserArticlesPage({
    params,
}: {
    params: { username: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value
    const user = token
        ? await cache(
              async () => authService.getPayloadFromToken(token),
              [token],
              {
                  revalidate: 10,
              },
          )()
        : null

    const articles = await articlesService.getArticles({
        currentUserId: user?.id ?? null,
        feedType: 'global',
        params: {
            authorName: params.username,
            favoritedBy: null,
            tag: null,
            limit: 10,
            offset: 0,
        },
    })

    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
            ))}
        </ul>
    )
}
