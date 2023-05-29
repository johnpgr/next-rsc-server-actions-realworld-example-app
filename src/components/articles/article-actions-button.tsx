import { Button } from "~/components/ui/button"
import Link from "next/link"
import { Pencil, Trash } from "lucide-react"
import { Profile } from "~/modules/users/users.types"
import { FollowUserButton } from "../profile/follow-user-button"
import clsx from "clsx"
import { FavoriteArticleButton } from "./favorite-article-button"
import { DeleteArticleButton } from "./delete-article-button"

export const ArticleActionsButton = (props: {
    article: {
        id: string
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
                        className="h-7 rounded-sm border-neutral-300 text-sm text-neutral-300"
                        asChild
                    >
                        <Link
                            href={`/editor/${props.article.slug}`}
                            className="flex items-center gap-1"
                        >
                            <Pencil size={16} /> Edit Article
                        </Link>
                    </Button>
                    <DeleteArticleButton
                        article={{
                            slug: props.article.slug,
                        }}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <FollowUserButton
                        user={props.article.author}
                        className={clsx({
                            "bg-transparent text-neutral-300":
                                !props.article.author.following,
                            "bg-neutral-300 text-black":
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
