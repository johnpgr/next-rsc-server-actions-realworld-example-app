import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ArticleList } from "~/components/articles/article-list"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"
import { usersService } from "~/modules/users/users.service"

export default async function FavoritesPage({
    params,
}: {
    params: { username: string }
}) {
    const session = await getServerSession(authOptions)
    const user = await usersService.getUserByName(params.username)

    if (!user) return notFound()

    const articles = await articlesService.getAllFavoritedByUser(
        user.id,
        session?.user?.id,
        10,
        0,
    )

    return <ArticleList articles={articles} />
}
