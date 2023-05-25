"use client"
import { Button } from "~/components/ui/button"
import Link from "next/link"
import { Plus, Settings } from "lucide-react"
import { useTransition } from "react"
import {
    followUserAction,
    unfollowUserAction,
} from "~/modules/follows/follows.actions"
import { useToast } from "../ui/use-toast"
import { useSession } from "next-auth/react"

type ProfileActionButtonProps = {
    user: { name: string; id: string }
    following: boolean
}
export const ProfileActionButton = ({
    user,
    following,
}: ProfileActionButtonProps) => {
    const [pending, startTransition] = useTransition()
    const {data:session} = useSession()
    const { toast } = useToast()
    const currentUsername = session?.user?.name

    async function handleFollowUser() {
        startTransition(async () => {
            if (!following) {
                const { data } = await followUserAction({
                    followingId: user.id,
                })

                if (data?.error) {
                    toast({
                        title: "Error",
                        description: data.error.message,
                    })
                }
            } else {
                const { data } = await unfollowUserAction({
                    followingId: user.id,
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
        <div className="ml-auto">
            {currentUsername === user.name ? (
                <Button
                    size={"sm"}
                    variant="outline"
                    className="bg-white hover:border-zinc-500 hover:bg-white"
                    asChild
                >
                    <Link href="/settings" className="flex items-center gap-1">
                        <Settings size={16} /> Edit Profile Settings
                    </Link>
                </Button>
            ) : (
                <Button
                    disabled={pending}
                    onClick={handleFollowUser}
                    size={"sm"}
                    variant="outline"
                    className="flex items-center gap-1 bg-white hover:border-zinc-500 hover:bg-white"
                >
                    <Plus size={16} /> {following ? "Unfollow" : "Follow"}{" "}
                    {user.name}
                </Button>
            )}
        </div>
    )
}
