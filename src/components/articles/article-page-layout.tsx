"use client"
import { Session } from "next-auth"
import { FeedTabs } from "./feed-tabs"
import { usePathname } from "next/navigation"

const articlePages = ["/", "/global"]

export const ArticlePageLayout = (props: {
    children: React.ReactNode
    session: Session | null
}) => {
    const path = usePathname()

    if (articlePages.includes(path))
        return (
            <div className="container mx-auto mt-6 max-w-5xl">
                <FeedTabs session={props.session} />
                {props.children}
            </div>
        )

    return <>{props.children}</>
}
