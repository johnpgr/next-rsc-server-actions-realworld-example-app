import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { USER_TOKEN } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"

export default async function ArticlePage({
    params,
}: {
    params: { slug: string }
}) {
    const session = await getServerSession(authOptions)

    const article = await articlesService.getBySlug(
        params.slug,
        session?.user?.id,
    )

    return <pre>{JSON.stringify(article, null, 4)}</pre>
}
