"use client"

import { Trash } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { deleteArticleAction } from "~/modules/articles/articles.actions"
import { useSession } from "next-auth/react"
import { useToast } from "../ui/use-toast"

export const DeleteArticleButton = (props: { article: { slug: string } }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const { toast } = useToast()
    const [pending, startTransition] = useTransition()

    async function handleDeleteArticle(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        startTransition(async () => {
            const res = await deleteArticleAction({
                slug: props.article.slug,
                session,
            })

            if (res?.data?.error) {
                toast({
                    title: "Error",
                    description: res.data.error.message,
                })
                return
            }

            if (res.data?.article) {
                router.push(`/profile/${session?.user?.name}`)
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="h-7 gap-1 rounded-sm border border-red-500 bg-transparent text-sm text-red-500 hover:bg-red-500 hover:text-white"
                    size={"sm"}
                >
                    <Trash size={14} /> Delete Article
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the article.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={pending}
                        onClick={handleDeleteArticle}
                        className="bg-neutral-700 hover:bg-neutral-900"
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
