"use client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "~/components/ui/button"
import {
    followUserAction,
    unfollowUserAction,
} from "~/modules/follows/follows.actions"
import { Profile } from "~/modules/users/users.types"
import { cn } from "~/utils/cn"
import { useToast } from "../ui/use-toast"

export const FollowUserButton = (props: {
    className?: string
    user: Profile
}) => {
    const router = useRouter()
    const { toast } = useToast()
    const [pending, startTransition] = useTransition()

    async function handleFollowUser() {
        startTransition(async () => {
            if (!props.user.following) {
                const { data } = await followUserAction({
                    followingId: props.user.id,
                })

                if (data?.error) {
                    toast({
                        title: "Error",
                        description: data.error.message,
                    })
                    return
                }
            } else {
                const { data } = await unfollowUserAction({
                    followingId: props.user.id,
                })

                if (data?.error) {
                    toast({
                        title: "Error",
                        description: data.error.message,
                    })
                }
            }
            // This router refresh here is to update the home page with the new feed after following a user
            // Because unfortunately Next.js revalidatePath / revalidateTag is not doing it's job.
            router.refresh()
        })
    }
    return (
        <Button
            disabled={pending}
            onClick={handleFollowUser}
            size={"sm"}
            variant="outline"
            className={cn(
                "h-7 gap-1 rounded-sm bg-white py-0 text-sm hover:border-zinc-500 hover:bg-white",
                props.className,
            )}
        >
            <Plus size={16} /> {props.user.following ? "Unfollow" : "Follow"}{" "}
            {props.user.name}
        </Button>
    )
}
