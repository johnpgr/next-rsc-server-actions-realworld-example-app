import React from 'react'
import { articlesService } from '~/modules/articles/articles.service'
import { ArticleRow } from './article-row'

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
    feedType: 'global' | 'user'
    parsedParams: ParsedParams
}) => {
    const articles = await articlesService.getArticles({
        currentUserId,
        feedType,
        params: parsedParams,
    })

    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow article={article} key={article.slug} />
            ))}
        </ul>
    )
}
