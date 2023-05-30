import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ArticleList } from "~/components/articles/article-list"
import { ARTICLE_PAGE_SIZE } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"
import { PageSearchParams, getSearchParam } from "~/utils/search-params"

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: PageSearchParams
}) {
    const page = getSearchParam(searchParams, "page")
    const pageNumber = page ? parseInt(page) : 1

    if (page && Number.isNaN(pageNumber)) {
        return notFound()
    }

    const offset = pageNumber !== 1 ? (pageNumber - 1) * ARTICLE_PAGE_SIZE : 0

    const session = await getServerSession(authOptions)
    const articles = session?.user
        ? await articlesService.getFeed(
              session.user.id,
              ARTICLE_PAGE_SIZE,
              offset,
          )
        : await articlesService.getAll(null, ARTICLE_PAGE_SIZE, offset)

    const articleCount = session?.user
        ? await articlesService.getFeedCount(session.user.id)
        : await articlesService.getAllCount()

    return (
        <ArticleList
            articles={articles}
            articleCount={articleCount}
            currentPage={pageNumber}
        />
    )
}
