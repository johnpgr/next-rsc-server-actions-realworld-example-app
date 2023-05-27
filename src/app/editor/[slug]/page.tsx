import { cookies } from "next/headers"
import { Editor } from "~/components/editor"
import { USER_TOKEN } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "~/modules/auth/auth.options"
import { getServerSession } from "next-auth"

export default async function EditorPage({
    params,
}: {
    params: { slug: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) redirect("/login")

    const article = await articlesService.getBySlug(
        params.slug,
        session.user.id,
    )

    if (!article) return notFound()

    const isArticleAuthor = await articlesService.isAuthor(
        session.user.id,
        params.slug,
    )

    if (!isArticleAuthor) redirect("/")

    return <Editor slug={params.slug} article={article} />
}
