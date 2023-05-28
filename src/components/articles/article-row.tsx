"use client"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { DEFAULT_USER_IMAGE } from "~/config/constants"
import { type Article } from "~/modules/articles/articles.types"
import { Badge } from "../ui/badge"
import { FavoriteArticleButton } from "./favorite-article-button"

export type ArticleRowProps = {
    article: Article
}

export const ArticleRow = (props: ArticleRowProps) => {
    const { article } = props

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
                        <span className="-mt-1 text-xs text-neutral-300">
                            {format(
                                new Date(article.createdAt),
                                "MMMM d, yyyy",
                            )}
                        </span>
                    </div>
                </div>
                <FavoriteArticleButton
                    article={{
                        favorited: article.favorited,
                        slug: article.slug,
                        favoritesCount: article.favoritesCount,
                    }}
                />
            </div>
            <Link href={`/article/${article.slug}`}>
                <h1 className="text-2xl font-semibold text-neutral-700">
                    {article.title}
                </h1>
                <p className="text-neutral-400">{article.description}</p>
                <div className="mt-2 flex w-full items-center justify-between">
                    <span className="text-xs text-neutral-300">Read more...</span>
                    <div className="space-x-1">
                        {article.tagList && article.tagList.length > 0
                            ? article.tagList.map((tag, i) => (
                                  <Badge
                                      key={`tag:${tag}_${i}`}
                                      variant={"outline"}
                                      className="font-normal text-neutral-400"
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
