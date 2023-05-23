'use client'
import { Button } from '~/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useUser } from './user-context'
import Image from 'next/image'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { DEFAULT_USER_IMAGE } from '~/lib/constants'

export default function UserButton() {
    const { user, logout } = useUser()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="flex items-center gap-1">
                    {user ? (
                        <Image
                            className="rounded-full"
                            src={user.image ?? DEFAULT_USER_IMAGE}
                            alt={user.username}
                            width={24}
                            height={24}
                        />
                    ) : null}
                    {user?.username}
                    <ChevronDown size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/profile/${user?.username}`}
                        className="flex cursor-pointer items-center gap-1"
                    >
                        <User size={16} />
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
                    onClick={logout}
                    className="flex items-center gap-1"
                >
                    <LogOut size={16} />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
