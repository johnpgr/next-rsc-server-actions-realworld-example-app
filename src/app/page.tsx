import { PageSearchParams, getSearchParams } from "~/utils/search-params"
import { Suspense } from "react"
import { ArticleList } from "~/components/articles/article-list"
import { getServerSession } from "next-auth"
import { authOptions } from "~/modules/auth/auth.options"
import { articlesService } from "~/modules/articles/articles.service"

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: PageSearchParams
}) {
    // const params = getSearchParams(searchParams, [
    //     "tag",
    //     "limit",
    //     "offset",
    //     "author",
    //     "favorited",
    // ])

    // const parsedParams = {
    //     limit:
    //         params.limit && !Number.isNaN(parseInt(params.limit))
    //             ? parseInt(params.limit)
    //             : 20,
    //     offset:
    //         params.offset && !Number.isNaN(parseInt(params.offset))
    //             ? parseInt(params.offset)
    //             : 0,
    //     tag: params.tag,
    //     authorName: params.author,
    //     favoritedBy: params.favorited,
    // }
    const session = await getServerSession(authOptions)
    const articles = await articlesService.getAll(session?.user?.id, 10, 0)

    return (
        <Suspense fallback={<div className="p-4">Loading articles...</div>}>
            <ArticleList articles={articles} />
        </Suspense>
    )
}
