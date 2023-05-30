import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ArticleList } from "~/components/articles/article-list"
import { ARTICLE_PAGE_SIZE } from "~/config/constants"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"
import { PageSearchParams, getSearchParam } from "~/utils/search-params"

export default async function TagPage({
    params,
    searchParams,
}: {
    params: { tagName: string }
    searchParams: PageSearchParams
}) {
    const page = getSearchParam(searchParams, "page")
    const pageNumber = page ? parseInt(page) : 1

    if (page && Number.isNaN(pageNumber)) {
        return notFound()
    }

    const offset = pageNumber !== 1 ? (pageNumber - 1) * ARTICLE_PAGE_SIZE : 0

    const session = await getServerSession(authOptions)
    const article = await articlesService.getAllByTag(
        params.tagName,
        session?.user?.id,
        ARTICLE_PAGE_SIZE,
        offset,
    )

    const articleCount = await articlesService.getAllByTagCount(params.tagName)

    return (
        <ArticleList
            articles={article}
            articleCount={articleCount}
            currentPage={pageNumber}
        />
    )
}
