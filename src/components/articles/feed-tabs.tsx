"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export const FeedTabs = (props: { username?: string | null }) => {
    const path = usePathname()
    const yourFeedLink = "/"
    const globalFeedLink = props.username ? "/global" : "/"

    return (
        <div className="flex items-center gap-2 border-b text-sm">
            {props.username && (
                <Link
                    href={yourFeedLink}
                    className={clsx("px-4 py-2", {
                        "border-b-2 border-primary text-primary":
                            path === yourFeedLink,
                        "text-zinc-500 transition-colors hover:text-zinc-800":
                            path !== yourFeedLink,
                    })}
                >
                    Your Feed
                </Link>
            )}
            <Link
                href={globalFeedLink}
                className={clsx("px-4 py-2 ", {
                    "border-b-2 border-primary text-primary":
                        path === globalFeedLink,
                    "text-zinc-500 transition-colors hover:text-zinc-800":
                        path !== globalFeedLink,
                })}
            >
                Global Feed
            </Link>
        </div>
    )
}
