import { Button } from "~/components/ui/button"
import Link from "next/link"
import { Pencil, Trash } from "lucide-react"
import { Profile } from "~/modules/users/users.types"
import { FollowUserButton } from "../profile/follow-user-button"
import clsx from "clsx"
import { FavoriteArticleButton } from "./favorite-article-button"

export const ArticleActionsButton = (props: {
    article: {
        slug: string
        favorited: boolean
        favoritesCount: number
        author: Profile
    }
    isAuthor: boolean
}) => {
    return (
        <div>
            {props.isAuthor ? (
                <div className="flex items-center gap-1">
                    <Button
                        size={"sm"}
                        variant="outline"
                        className="h-7 rounded-sm border-stone-300 text-sm text-stone-300"
                        asChild
                    >
                        <Link
                            href={`/editor/${props.article.slug}`}
                            className="flex items-center gap-1"
                        >
                            <Pencil size={16} /> Edit Article
                        </Link>
                    </Button>
                    <Button
                        className="h-7 gap-1 rounded-sm border border-red-500 bg-transparent text-sm text-red-500 hover:bg-red-500 hover:text-white"
                        size={"sm"}
                    >
                        <Trash size={14} /> Delete Article
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <FollowUserButton
                        user={props.article.author}
                        className={clsx({
                            "bg-transparent text-stone-300":
                                !props.article.author.following,
                            "bg-stone-300 text-black":
                                props.article.author.following,
                        })}
                    />
                    <FavoriteArticleButton
                        articlePage
                        article={{
                            slug: props.article.slug,
                            favorited: props.article.favorited,
                            favoritesCount: props.article.favoritesCount,
                        }}
                    />
                </div>
            )}
        </div>
    )
}