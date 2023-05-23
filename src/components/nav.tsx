'use client'

import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { useUser } from '~/components/user-context'
import { Edit, Home, User, UserCircle, UserCircle2 } from 'lucide-react'
import Image from 'next/image'
import UserButton from './user-button'

export const Nav = () => {
    const { user } = useUser()
    return (
        <nav className="flex w-full items-center justify-end bg-neutral-100 p-4">
            <Button asChild variant="link">
                <Link href="/" className="flex items-center gap-1">
                    <Home size={16} />
                    Home
                </Link>
            </Button>
            {user && (
                <div className="flex items-center">
                    <Button asChild variant="link">
                        <Link
                            href="/editor"
                            className="flex items-center gap-1"
                        >
                            <Edit size={16} />
                            New Article
                        </Link>
                    </Button>
                    <UserButton/>
                </div>
            )}
            {!user && (
                <div>
                    <Button asChild variant="link">
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/register">Sign up</Link>
                    </Button>
                </div>
            )}
        </nav>
    )
}
