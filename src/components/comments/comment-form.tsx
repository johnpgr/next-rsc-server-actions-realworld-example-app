"use client"

import { Textarea } from "../ui/textarea"
import { UserImage } from "../profile/user-image"
import { Button } from "../ui/button"
import { FormEvent, useRef, useTransition } from "react"
import { getFormData } from "~/utils/forms"
import { createCommentAction } from "~/modules/comments/comments.actions"
import { useToast } from "../ui/use-toast"
import { Spinner } from "../spinner"
import type { Session } from "next-auth"
import Link from "next/link"

export const CommentForm = (props: {
    article: {
        slug: string
    }
    session: Session | null
}) => {
    const { toast } = useToast()
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [pending, startTransition] = useTransition()

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        startTransition(async () => {
            const { body } = getFormData<{ body: string }>(e)
            const res = await createCommentAction({
                body,
                article: {
                    slug: props.article.slug,
                },
                session: props.session,
            })

            if (res.data?.error) {
                toast({
                    title: "Error",
                    description: res.data.error.message,
                })
                return
            }

            if (res.data?.comment) {
                textAreaRef.current!.value = ""
            }
        })
    }

    if (!props.session)
        return (
            <div className="py-16">
                <p className="text-center">
                    <Button
                        asChild
                        variant={"link"}
                        className="h-fit w-fit p-0 text-primary"
                    >
                        <Link href={"/login"}>Sign in</Link>
                    </Button>{" "}
                    or{" "}
                    <Button
                        asChild
                        variant={"link"}
                        className="h-fit w-fit p-0 text-primary"
                    >
                        <Link href={"/register"}>Sign up</Link>
                    </Button>{" "}
                    to add comments on this article.
                </p>
            </div>
        )

    return (
        <form onSubmit={handleSubmit} className="flex justify-center py-16">
            <div className="w-full max-w-3xl rounded border">
                <Textarea
                    ref={textAreaRef}
                    placeholder="Write a comment..."
                    className="focus rounded-none rounded-t border-x-0 border-b border-t-0 p-4"
                    name="body"
                />
                <div className="flex items-center justify-between p-4">
                    <UserImage
                        name={props.session?.user?.name ?? ""}
                        image={props.session?.user?.image}
                    />
                    <Button
                        size={"sm"}
                        className="gap-1 font-bold"
                        disabled={pending}
                    >
                        {pending ? <Spinner size={16} /> : null}
                        Post Comment
                    </Button>
                </div>
            </div>
        </form>
    )
}
