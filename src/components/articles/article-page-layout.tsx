"use client"
import React from "react"
import { FeedTabs } from "./feed-tabs"
import { usePathname } from "next/navigation"

const articlePages = ["/", "/global"]

export const ArticlePageLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const path = usePathname()

    if (articlePages.includes(path))
        return (
            <div className="container mx-auto mt-6 max-w-5xl">
                <FeedTabs />
                {children}
            </div>
        )

    return <>{children}</>
}
