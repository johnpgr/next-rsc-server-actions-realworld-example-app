'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export const ProfileTabs = (props: { username: string }) => {
    const path = usePathname()
    const myArticlesLink = `/profile/${props.username}`
    const favoritesLink = `/profile/${props.username}/favorites`
    return (
        <div className="flex items-center gap-2 text-sm border-b">
            <Link
                href={myArticlesLink}
                className={clsx('px-4 py-2', {
                    'border-b-2 border-primary text-primary':
                        path === myArticlesLink,
                    'text-zinc-500 transition-colors hover:text-zinc-800':
                        path !== myArticlesLink,
                })}
            >
                My Articles
            </Link>
            <Link
                href={favoritesLink}
                className={clsx('px-4 py-2 ', {
                    'border-b-2 border-primary text-primary':
                        path === favoritesLink,
                    'text-zinc-500 transition-colors hover:text-zinc-800':
                        path !== favoritesLink,
                })}
            >
                Favorited Articles
            </Link>
        </div>
    )
}
