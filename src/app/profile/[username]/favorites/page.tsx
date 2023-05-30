import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ArticleList } from "~/components/articles/article-list"
import { ARTICLE_PAGE_SIZE } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"
import { usersService } from "~/modules/users/users.service"
import { PageSearchParams, getSearchParam } from "~/utils/search-params"

export default async function FavoritesPage({
    params,
    searchParams,
}: {
    params: { username: string }
    searchParams: PageSearchParams
}) {
    const page = getSearchParam(searchParams, "page")
    const pageNumber = page ? parseInt(page) : 1

    if (page && Number.isNaN(pageNumber)) {
        return notFound()
    }

    const offset = pageNumber !== 1 ? (pageNumber - 1) * ARTICLE_PAGE_SIZE : 0

    const session = await getServerSession(authOptions)
    const user = await usersService.getUserByName(params.username)

    if (!user) return notFound()

    const articles = await articlesService.getAllFavoritedByUser(
        user.id,
        session?.user?.id,
        ARTICLE_PAGE_SIZE,
        offset,
    )

    const articleCount = await articlesService.getAllFavoritedByUserCount(
        user.id,
    )

    return (
        <ArticleList
            articles={articles}
            articleCount={articleCount}
            currentPage={pageNumber}
        />
    )
}
