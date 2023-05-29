import type { Session } from "next-auth"
import { format } from "date-fns"
import { decodeTime } from "ulid"
import { commentsService } from "~/modules/comments/comments.service"
import { articlesService } from "~/modules/articles/articles.service"
import { UserImage } from "../profile/user-image"
import Link from "next/link"
import { Button } from "../ui/button"

export const CommentList = async (props: {
    article: {
        slug: string
    }
    session: Session | null
}) => {
    const article = await articlesService.getBySlug(props.article.slug)
    if (!article) return null

    const comments = await commentsService.getCommentsFromArticleId(
        article.id,
        props.session?.user?.id ?? null,
    )

    return (
        <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-8">
            {comments.map((comment) => (
                <li key={comment.id} className="w-full rounded border">
                    <div className="border-b p-6">{comment.body}</div>
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <div className="flex w-full items-center gap-2 bg-muted p-4">
                                <Link href={`/profile/${comment.author.name}`}>
                                    <UserImage
                                        className="h-6 w-6"
                                        image={
                                            comment.author.image ?? undefined
                                        }
                                        name={comment.author.name}
                                    />
                                </Link>
                                <Button
                                    asChild
                                    variant={"link"}
                                    className="h-fit w-fit p-0 text-xs text-primary"
                                >
                                    <Link
                                        href={`/profile/${comment.author.name}`}
                                    >
                                            {comment.author.name}
                                    </Link>
                                </Button>
                                <span className="text-xs text-muted-foreground/60">
                                    {format(
                                        decodeTime(comment.id),
                                        "MMM dd, yyyy",
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}
