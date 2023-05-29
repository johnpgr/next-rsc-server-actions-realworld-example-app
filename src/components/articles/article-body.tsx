import Markdown from "markdown-to-jsx"
import { type Article } from "~/modules/articles/articles.types"
import { cn } from "~/utils/cn"

export const ArticleBody = (props: {
    body: Article["body"]
    className?: string
}) => {
    return (
        <article
            className={cn(
                "prose mt-8 max-w-none px-0 pb-16 text-neutral-700 lg:prose-xl prose-headings:mb-6",
                props.className,
            )}
        >
            <Markdown
                options={{
                    disableParsingRawHTML: true,
                }}
            >
                {props.body}
            </Markdown>
        </article>
    )
}
