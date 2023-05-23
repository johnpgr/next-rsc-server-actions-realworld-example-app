'use client'
import Image from 'next/image'
import { format } from 'date-fns'
import Link from 'next/link'
import { ParsedArticleQueryResponse } from '~/services/articles'
import { DEFAULT_USER_IMAGE } from '~/lib/constants'
import { Button } from '../ui/button'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import {
    favoriteArticleAction,
    unfavoriteArticleAction,
} from '~/app/profile/[username]/actions'
import { FormEvent, useState } from 'react'
import { revalidatePath } from 'next/cache'
import { usePathname } from 'next/navigation'
import { getFormData } from '~/lib/utils'

export type ArticleRowProps = {
    article: ParsedArticleQueryResponse
}

export const ArticleRow = (props: ArticleRowProps) => {
    const { article } = props
    const path = usePathname()
    const [error, setError] = useState('')
    const [isFavoriting, setIsFavoriting] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsFavoriting(true)

        const { favorited, slug } = getFormData<{
            slug: string
            favorited: string
        }>(e)

        if (favorited === 'true') {
            // unfavorite
            const { data } = await unfavoriteArticleAction({
                article: { slug },
            })
            if (data?.error) {
                setError(data.error.message)
            }

            if (data?.articleId) {
                revalidatePath(path)
            }
        } else {
            // favorite
            const { data } = await favoriteArticleAction({
                article: { slug },
            })
            if (data?.error) {
                setError(data.error.message)
            }

            if (data?.articleId) {
                revalidatePath(path)
            }
        }

        setIsFavoriting(false)
    }

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
                <form onSubmit={onSubmit}>
                    <Button
                        type="submit"
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
                    {error && (
                        <span className="text-xs text-red-500">{error}</span>
                    )}
                </form>
            </div>
        </div>
    )
}
