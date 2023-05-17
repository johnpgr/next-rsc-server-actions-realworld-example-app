"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { useUser } from "~/components/user-context"
import { User } from "lucide-react"

export const Nav = () => {
    const { user, logout } = useUser()
    return (
        <nav className="items-centr flex w-full justify-end bg-neutral-100 p-4">
            {user && (
                <div>
                    <Button asChild variant="link">
                        <Link
                            href="/profile"
                            className="flex items-center gap-1"
                        >
                            <User size={16} />
                            {user.username}
                        </Link>
                    </Button>
                    <Button onClick={() => logout()}>Sign out</Button>
                </div>
            )}
            {!user && (
                <Button asChild variant="link">
                    <Link href="/login">Sign in</Link>
                </Button>
            )}
            {!user && (
                <Button asChild variant="link">
                    <Link href="/register">Sign up</Link>
                </Button>
            )}
        </nav>
    )
}
