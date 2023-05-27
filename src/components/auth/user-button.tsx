"use client"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import Image from "next/image"
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { DEFAULT_USER_IMAGE } from "~/config/constants"
import { signOut, useSession } from "next-auth/react"

export default function UserButton() {
    const {data:session} = useSession()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="flex items-center gap-1">
                    {session?.user ? (
                        <Image
                            className="rounded-full"
                            src={session.user.image ?? DEFAULT_USER_IMAGE}
                            alt={session.user.name ?? "Unknown user"}
                            width={24}
                            height={24}
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
                    className="flex items-center gap-1 cursor-pointer"
                >
                    <LogOut size={16} />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
