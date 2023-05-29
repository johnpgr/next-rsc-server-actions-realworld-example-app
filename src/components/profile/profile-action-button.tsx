"use client"
import { Settings } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { type Profile } from "~/modules/users/users.types"
import { FollowUserButton } from "./follow-user-button"

type ProfileActionButtonProps = {
    user: Profile
}
export const ProfileActionButton = ({ user }: ProfileActionButtonProps) => {
    const { data: session } = useSession()
    const currentUsername = session?.user?.name

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
                <FollowUserButton user={user} />
            )}
        </div>
    )
}
