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
import { ChevronDown, LogOut, Settings, User, UserCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function UserButton() {
    const { user, logout } = useUser()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="flex items-center gap-1">
                    {user && user.image ? (
                        <Image
                            className="rounded-full"
                            src={user.image}
                            alt={user.username}
                            width={20}
                            height={20}
                        />
                    ) : (
                        <UserCircle2 size={20} />
                    )}
                    {user?.username}
                    <ChevronDown size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center gap-1">
                        <User size={16} />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center gap-1">
                        <Settings size={16} />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className='flex items-center gap-1'>
                    <LogOut size={16} />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
