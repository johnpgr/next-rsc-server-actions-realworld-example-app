import { ArticleRow } from "./article-row"
import { Article } from "~/modules/articles/articles.types"

export const ArticleList = (props: {articles:Article[]}) => {

    return (
        <ul className="divide-y">
            {props.articles.map((article) => (
                <ArticleRow article={article} key={article.slug} />
            ))}
        </ul>
    )
}
