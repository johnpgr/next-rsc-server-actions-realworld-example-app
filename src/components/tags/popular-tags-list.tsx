"use client"
import { usePathname } from "next/navigation"
import { Badge } from "../ui/badge"
import Link from "next/link"
import { isArticlesPage } from "~/utils/layout"

export const PopularTagsList = (props: { tags: string[] }) => {
    const path = usePathname()

    if (!isArticlesPage(path)) return null

    return (
        <div className="mr-auto mt-6 flex h-fit w-64 flex-col gap-2 rounded bg-muted px-4 pb-4 pt-2">
            <span>Popular tags</span>
            <ul className="flex flex-wrap gap-1">
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
