import React from "react"
import { articlesService } from "~/modules/articles/articles.service"
import { ArticleRow } from "./article-row"
import { unstable_cache as cache } from "next/cache"

type ParsedParams = {
    limit: number
    offset: number
    tag: string | null
    authorName: string | null
    favoritedBy: string | null
}

export const ArticleList = async ({
    currentUserId,
    parsedParams,
    feedType,
}: {
    currentUserId: string | null
    feedType: "global" | "user"
    parsedParams: ParsedParams
}) => {
    const articles = await cache(
        () =>
            articlesService.getArticles({
                currentUserId,
                feedType,
                params: parsedParams,
            }),
        [`${feedType}_article_list`],
        {
            tags: [`${feedType}_article_list`],
        },
    )()

    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow article={article} key={article.slug} />
            ))}
        </ul>
    )
}
