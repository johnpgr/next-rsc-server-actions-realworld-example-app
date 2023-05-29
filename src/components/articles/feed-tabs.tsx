"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { Session } from "next-auth"
import { HashIcon } from "lucide-react"

export const FeedTabs = (props: { session: Session | null }) => {
    const path = usePathname()
    const yourFeedLink = "/"
    const globalFeedLink = props.session?.user?.name ? "/global" : "/"

    return (
        <div className="flex items-center gap-2 border-b">
            {props.session?.user?.name && (
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
                className={clsx("px-4 py-2", {
                    "border-b-2 border-primary text-primary":
                        path === globalFeedLink,
                    "text-zinc-500 transition-colors hover:text-zinc-800":
                        path !== globalFeedLink,
                })}
            >
                Global Feed
            </Link>
            {path.startsWith("/tag/") && (
                <Button className="flex h-fit w-fit items-center gap-1 rounded-none border-b-2 border-primary bg-transparent px-4 py-2 text-primary hover:bg-transparent">
                    <HashIcon size={20} />
                    {path.split("/")[2]}
                </Button>
            )}
        </div>
    )
}
