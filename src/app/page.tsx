import { cookies } from "next/headers"
import { USER_TOKEN } from "~/config/constants"
import { PageSearchParams, getSearchParams } from "~/utils/search-params"
import { authService } from "~/modules/auth/auth.service"
import { Suspense } from "react"
import { ArticleList } from "~/components/articles/article-list"

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: PageSearchParams
}) {
    const params = getSearchParams(searchParams, [
        "tag",
        "limit",
        "offset",
        "author",
        "favorited",
    ])

    const parsedParams = {
        limit:
            params.limit && !Number.isNaN(parseInt(params.limit))
                ? parseInt(params.limit)
                : 20,
        offset:
            params.offset && !Number.isNaN(parseInt(params.offset))
                ? parseInt(params.offset)
                : 0,
        tag: params.tag,
        authorName: params.author,
        favoritedBy: params.favorited,
    }

    const token = cookies().get(USER_TOKEN)?.value

    const currentUser = token
        ? await authService.getPayloadFromToken(token)
        : null

    return (
        <Suspense fallback={<div className="p-4">Loading articles...</div>}>
            {/* @ts-expect-error Async server component */}
            <ArticleList
                currentUserId={currentUser?.id ?? null}
                parsedParams={parsedParams}
                feedType="user"
            />
        </Suspense>
    )
}
