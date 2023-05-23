'use client'
import Image from 'next/image'
import { format } from 'date-fns'
import Link from 'next/link'
import { ParsedArticleQueryResponse } from '~/services/articles'
import { DEFAULT_USER_IMAGE } from '~/lib/constants'
import { Button } from '../ui/button'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import { useState, useTransition } from 'react'
import { useUser } from '../user-context'

export type ArticleRowProps = {
    article: ParsedArticleQueryResponse
    favoriteHandler: (args: {
        favorited: boolean
        slug: string
        username: string
    }) => Promise<void>
}

export const ArticleRow = (props: ArticleRowProps) => {
    const { article, favoriteHandler } = props
    const [error, setError] = useState('')
    const { user } = useUser()
    const [isFavoriting, setIsFavoriting] = useState(false)
    const [pending, startTransition] = useTransition()

    return (
        <div className="py-4">
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src={article.author.image ?? DEFAULT_USER_IMAGE}
                        alt={article.author.username}
                        className="rounded-full"
                        width={32}
                        height={32}
                    />
                    <div className="flex flex-col">
                        <Link
                            href={`/profile/${article.author.username}`}
                            className="text-primary"
                        >
                            {article.author.username}
                        </Link>
                        <span className="text-xs text-zinc-300">
                            {format(
                                new Date(article.createdAt),
                                'MMMM d, yyyy',
                            )}
                        </span>
                    </div>
                </div>
                <Button
                    onClick={() =>
                        startTransition(() => {
                            if (user) {
                                favoriteHandler({
                                    favorited: article.favorited,
                                    slug: article.slug,
                                    username: user.username,
                                })
                            } else {
                                setError('You must be logged in to favorite')
                            }
                        })
                    }
                    disabled={isFavoriting}
                    className={clsx(
                        'h-7 gap-1 rounded-sm border-primary py-0 text-sm text-primary hover:bg-primary hover:text-white',
                        {
                            'bg-primary text-white': article.favorited,
                        },
                    )}
                    variant={'outline'}
                    size={'sm'}
                >
                    <Heart size={14} />
                    {article.favoritesCount}
                </Button>
                {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
        </div>
    )
}
