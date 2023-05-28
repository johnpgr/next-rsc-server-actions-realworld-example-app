"use client"
import { usePathname } from "next/navigation"
import { Badge } from "../ui/badge"
import Link from "next/link"
import { isArticlesPage } from "~/utils/layout"

export const PopularTagsList = (props: { tags: string[] }) => {
    const path = usePathname()

    if (!isArticlesPage(path)) return null

    return (
        <div className="flex h-fit w-64 mr-auto flex-col rounded bg-muted mt-6 px-4 pt-2 pb-4 gap-2">
            <span>Popular tags</span>
            <ul className="flex gap-1 flex-wrap">
                {props.tags.map((tag) => (
                    <Badge
                        className="bg-neutral-500 hover:bg-neutral-600"
                        key={`tag_${tag}`}
                        asChild
                    >
                        <Link href={`/tag/${tag}`}>{tag}</Link>
                    </Badge>
                ))}
            </ul>
        </div>
    )
}
