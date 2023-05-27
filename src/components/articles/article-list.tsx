import React from "react"
import { articlesService } from "~/modules/articles/articles.service"
import { ArticleRow } from "./article-row"

export const ArticleList = async ({
    currentUserId,
}: {
    currentUserId: string | null
}) => {
    const articles = await articlesService.getAll(currentUserId, 10, 0)

    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow article={article} key={article.slug} />
            ))}
        </ul>
    )
}
