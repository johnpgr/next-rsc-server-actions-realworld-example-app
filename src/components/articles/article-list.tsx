import { ARTICLE_PAGE_SIZE } from "~/config/constants"
import { Article } from "~/modules/articles/articles.types"
import { ArticlePaginationLink } from "./article-pagination-link"
import { ArticleRow } from "./article-row"

export const ArticleList = (props: {
    articles: Article[]
    articleCount: number
    currentPage: number
}) => {
    const { articleCount: fullArticleCount } = props
    const pageCount = Math.ceil(fullArticleCount / ARTICLE_PAGE_SIZE)

    return (
        <div className="flex flex-col gap-8 pb-8">
            <ul className="divide-y">
                {props.articles.map((article) => (
                    <ArticleRow article={article} key={article.slug} />
                ))}
            </ul>
            <ul className="mx-4 flex w-fit divide-x rounded border">
                {new Array(pageCount).fill(0).map((_, i) => (
                    <ArticlePaginationLink
                        currentPage={props.currentPage}
                        key={`page_${i}`}
                        pageCount={pageCount}
                        i={i}
                    />
                ))}
            </ul>
        </div>
    )
}
