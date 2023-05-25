"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { useSession } from "next-auth/react"

export const FeedTabs = () => {
    const { data: session } = useSession()
    const path = usePathname()
    const yourFeedLink = "/"
    const globalFeedLink = session?.user?.name ? "/global" : "/"

    return (
        <div className="flex items-center gap-2 border-b text-sm">
            {session?.user?.name && (
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
