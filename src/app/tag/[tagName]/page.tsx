import { getServerSession } from "next-auth"
import { ArticleList } from "~/components/articles/article-list"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"

export default async function TagPage({
    params,
}: {
    params: { tagName: string }
}) {
    const session = await getServerSession(authOptions)
    const article = await articlesService.getAllByTag(
        params.tagName,
        session?.user?.id,
        10,
        0,
    )
    return <ArticleList articles={article} />
}
