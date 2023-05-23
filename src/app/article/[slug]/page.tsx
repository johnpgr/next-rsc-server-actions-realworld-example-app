import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/lib/constants'
import { articlesService } from '~/services/articles'
import { authService } from '~/services/auth'

export default async function ArticlePage({
    params,
}: {
    params: { slug: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    const id = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    const article = await articlesService.getArticleBySlug(params.slug, id)
    return <pre>{JSON.stringify(article, null, 4)}</pre>
}
