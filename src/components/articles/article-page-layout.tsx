"use client"
import { Session } from "next-auth"
import { FeedTabs } from "./feed-tabs"
import { usePathname } from "next/navigation"
import { isArticlesPage } from "~/utils/layout"

export const ArticlePageLayout = (props: {
    children: React.ReactNode
    session: Session | null
}) => {
    const path = usePathname()

    if (!isArticlesPage(path)) return <>{props.children}</>

    return (
        <div className="mt-6 flex-1 max-w-[855px] ml-auto">
            <FeedTabs session={props.session} />
            {props.children}
        </div>
    )
}
