import Markdown from "markdown-to-jsx"
import { type Article } from "~/modules/articles/articles.types"
import { cn } from "~/utils/cn"

export const ArticleBody = (props: {
    body: Article["body"]
    className?: string
}) => {
    return (
        <div
            className={cn(
                "prose lg:prose-xl text-stone-700 px-0 mt-8 text-lg pb-16",
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
        </div>
    )
}
