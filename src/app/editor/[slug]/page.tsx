import { cookies } from 'next/headers'
import { Editor } from '~/components/editor'
import { USER_TOKEN } from '~/config/constants'
import { authService } from '~/modules/auth/auth.service'
import { articlesService } from '~/modules/articles/articles.service'
import { notFound, redirect } from 'next/navigation'

//runtime edge doesnt work here
export const runtime = 'nodejs'

export default async function EditorPage({
    params,
}: {
    params: { slug: string }
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    if (!currentUser) redirect('/login')

    const article = await articlesService.getArticleBySlug(
        params.slug,
        currentUser.id,
    )

    if (!article) return notFound()

    const isArticleAuthor = await articlesService.isArticleAuthor(
        currentUser.id,
        params.slug,
    )

    if (!isArticleAuthor) redirect('/')

    return <Editor slug={params.slug} article={article} />
}
