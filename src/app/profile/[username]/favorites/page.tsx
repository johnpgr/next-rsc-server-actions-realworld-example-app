import { getServerSession } from "next-auth"
import { ArticleList } from "~/components/articles/article-list"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"

export default async function FavoritesPage({
    params,
}: {
    params: { username: string }
}) {
    const session = await getServerSession(authOptions)
    const articles = await articlesService.getAllFavoritedByUser(
        params.username,
        session?.user?.id,
        10,
        0,
    )

    return <ArticleList articles={articles} />
}
