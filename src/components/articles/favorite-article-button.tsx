"use client"
import clsx from "clsx"
import { Heart } from "lucide-react"
import React, { useTransition } from "react"
import { Button } from "~/components/ui/button"
import { useToast } from "../ui/use-toast"
import { useSession } from "next-auth/react"
import {
    favoriteArticleAction,
    unfavoriteArticleAction,
} from "~/modules/favorites/favorites.actions"

export const FavoriteArticleButton = (props: {
    article: {
        slug: string
        favorited: boolean
        favoritesCount: number
    }
    articlePage?: boolean
}) => {
    const { toast } = useToast()
    const { data: session } = useSession()
    const [pending, startTransition] = useTransition()

    function handleFavorite() {
        startTransition(async () => {
            if (!props.article.favorited) {
                const { data } = await favoriteArticleAction({
                    article: {
                        slug: props.article.slug,
                    },
                    session,
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
                        slug: props.article.slug,
                    },
                    session,
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
        <Button
            onClick={handleFavorite}
            disabled={pending}
            className={clsx(
                "h-7 gap-1 rounded-sm border-primary py-0 text-sm text-primary hover:bg-primary hover:text-white",
                {
                    "bg-primary text-white": props.article.favorited,
                },
            )}
            variant={"outline"}
            size={"sm"}
        >
            <Heart size={14} />
            {props.articlePage && "Favorite Article "}
            {props.articlePage
                ? `(${props.article.favoritesCount})`
                : props.article.favoritesCount}
        </Button>
    )
}
