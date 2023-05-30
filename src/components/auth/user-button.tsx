"use client"
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react"
import { type Session } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { UserImage } from "../profile/user-image"

export default function UserButton(props: { session: Session | null }) {
    const { session } = props
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="flex items-center gap-1">
                    {session?.user ? (
                        <UserImage
                            name={session.user.name ?? "Unknown user"}
                            image={session.user.image}
                        />
                    ) : null}
                    {session?.user?.name ?? "Unknown user"}
                    <ChevronDown size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/profile/${session?.user?.name}`}
                        className="flex cursor-pointer items-center gap-1"
                    >
                        <UserIcon size={16} />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/settings"
                        className="flex cursor-pointer items-center gap-1"
                    >
                        <Settings size={16} />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex cursor-pointer items-center gap-1"
                >
                    <LogOut size={16} />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
