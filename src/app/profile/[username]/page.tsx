import { cookies } from 'next/headers'
import { ArticleRow } from '~/components/article-row'
import { USER_TOKEN } from '~/lib/constants'
import { articlesService } from '~/services/articles'
import { authService } from '~/services/auth'
import { unstable_cache as cache, revalidateTag } from 'next/cache'
import { favoritesService } from '~/services/favorites'

export const runtime = 'nodejs'

export default async function UserArticlesPage({
    params,
}: {
    params: { username: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await cache(
              async () => await authService.getPayloadFromToken(token),
              [token],
              { revalidate: 60 },
          )()
        : null

    const currentUserId = currentUser
        ? await cache(
              async () =>
                  await authService.getUserIdByUserName(currentUser.username),
              [`ID:${currentUser.username}`],
              { revalidate: 60 },
          )()
        : null

    const articles = await cache(
        async () =>
            await articlesService.getArticles({
                currentUserId,
                feedType: 'global',
                params: {
                    authorName: params.username,
                    tag: null,
                    limit: 6,
                    offset: 0,
                    favoritedBy: null,
                },
            }),
        [`ARTICLES_BY_AUTHOR:${params.username}`],
        {
            revalidate: 60 * 60 * 24,
            tags: [`ARTICLES_BY_AUTHOR:${params.username}`],
        },
    )()

    async function handleFavorite(args: {
        favorited: boolean
        slug: string
        username: string
    }) {
        'use server'
        const { favorited, slug, username} = args

        const userId = await authService.getUserIdByUserName(username)

        if (favorited) {
            // unfavorite
            const articleId = await articlesService.getArticleIdBySlug(slug)
            if (!articleId) return

            await favoritesService.unfavoriteArticle({
                articleId,
                userId
            })
        } else {
            // favorite
            const articleId = await articlesService.getArticleIdBySlug(slug)
            if (!articleId) return
            await favoritesService.favoriteArticle({
                articleId,
                userId
            })
        }
        revalidateTag(`ARTICLE_BY_AUTHOR:${params.username}`)
    }
    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow
                    favoriteHandler={handleFavorite}
                    key={article.slug}
                    article={article}
                />
            ))}
        </ul>
    )
}
