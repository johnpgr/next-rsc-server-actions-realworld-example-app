import { ArticleRow } from "./article-row"
import { Article } from "~/modules/articles/articles.types"
import { ARTICLE_PAGE_SIZE } from "~/config/constants"
import Link from "next/link"
import { Button } from "../ui/button"
import clsx from "clsx"

export const ArticleList = (props: {
    articles: Article[]
    articleCount: number
    currentPage: number
}) => {
    const { articleCount: fullArticleCount } = props
    // get number of pages. page size is ARTICLE_PAGE_SIZE
    const pageCount = Math.ceil(fullArticleCount / ARTICLE_PAGE_SIZE)

    return (
        <div className="flex flex-col gap-8 pb-8">
            <ul className="divide-y">
                {props.articles.map((article) => (
                    <ArticleRow article={article} key={article.slug} />
                ))}
            </ul>
            <ul className="flex w-fit divide-x rounded border mx-4">
                {new Array(pageCount).fill(0).map((_, i) => (
                    <Button
                        key={`page_${i}`}
                        variant={"link"}
                        size={"sm"}
                        className={clsx(
                            "rounded-none bg-transparent text-primary",
                            {
                                "bg-primary text-white":
                                    props.currentPage === i + 1,
                                // first element
                                "rounded-bl rounded-tl": i === 0,
                                // last element
                                "rounded-br rounded-tr": i === pageCount - 1,
                            },
                        )}
                        asChild
                    >
                        <Link href={`?page=${i + 1}`}>{i + 1}</Link>
                    </Button>
                ))}
            </ul>
        </div>
    )
}
