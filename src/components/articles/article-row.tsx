"use client"
import Image from "next/image"
import { format } from "date-fns"
import Link from "next/link"
import { type ParsedArticleQueryResponse } from "~/modules/articles/articles.types"
import { DEFAULT_USER_IMAGE } from "~/config/constants"
import { Button } from "../ui/button"
import { Heart } from "lucide-react"
import clsx from "clsx"
import { useTransition } from "react"
import { useToast } from "../ui/use-toast"
import {
    favoriteArticleAction,
    unfavoriteArticleAction,
} from "~/modules/favorites/favorites.actions"
import { Badge } from "../ui/badge"

export type ArticleRowProps = {
    article: ParsedArticleQueryResponse
}

export const ArticleRow = (props: ArticleRowProps) => {
    const { article } = props
    const { toast } = useToast()
    const [pending, startTransition] = useTransition()

    function handleFavorite() {
        startTransition(async () => {
            if (!article.favorited) {
                const { data } = await favoriteArticleAction({
                    article: {
                        slug: article.slug,
                    },
                })

                if (data?.error) {
                    toast({
                        title: "Error",
                        description: data.error.message,
                    })
                }
            } else {
                const { data } = await unfavoriteArticleAction({
                    article: {
                        slug: article.slug,
                    },
                })
                if (data?.error) {
                    toast({
                        title: "Error",
                        description: data.error.message,
                    })
                }
            }
        })
    }

    return (
        <div className="space-y-2 py-4">
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
                        <span className="-mt-1 text-xs text-gray-300">
                            {format(
                                new Date(article.createdAt),
                                "MMMM d, yyyy",
                            )}
                        </span>
                    </div>
                </div>
                <Button
                    onClick={handleFavorite}
                    disabled={pending}
                    className={clsx(
                        "h-7 gap-1 rounded-sm border-primary py-0 text-sm text-primary hover:bg-primary hover:text-white",
                        {
                            "bg-primary text-white": article.favorited,
                        },
                    )}
                    variant={"outline"}
                    size={"sm"}
                >
                    <Heart size={14} />
                    {article.favoritesCount}
                </Button>
            </div>
            <Link href={`/article/${article.slug}`}>
                <h1 className="text-2xl font-semibold text-stone-700">
                    {article.title}
                </h1>
                <p className="text-gray-400">{article.description}</p>
                <div className="mt-2 flex w-full items-center justify-between">
                    <span className="text-xs text-gray-300">Read more...</span>
                    <div className="space-x-1">
                        {article.tagList && article.tagList.length > 0
                            ? article.tagList.map((tag, i) => (
                                  <Badge
                                      key={`tag:${tag}_${i}`}
                                      variant={"outline"}
                                      className="font-normal text-gray-400"
                                  >
                                      {tag}
                                  </Badge>
                              ))
                            : null}
                    </div>
                </div>
            </Link>
        </div>
    )
}
