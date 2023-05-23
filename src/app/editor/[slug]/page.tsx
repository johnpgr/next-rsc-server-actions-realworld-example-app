import { cookies } from 'next/headers'
import { Editor } from '../editor'
import { USER_TOKEN } from '~/lib/constants'
import { authService } from '~/services/auth'
import { articlesService } from '~/services/articles'
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

    const id = currentUser
        ? await authService.getUserIdByUserName(currentUser.username)
        : null

    if (!id) {
        redirect('/login')
    }

    const article = await articlesService.getArticleBySlug(params.slug, id)

    const isArticleAuthor = await articlesService.isArticleAuthor(
        id,
        params.slug,
    )

    if (!isArticleAuthor) redirect('/')

    return <Editor slug={params.slug} article={article} />
}
