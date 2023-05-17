"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { useUser } from "~/components/user-context"
import { User } from "lucide-react"

export const Nav = () => {
    const { user, isLoading, logout } = useUser()
    return (
        <nav className="bg-neutral-100 p-4 w-full flex items-centr justify-end">
            {isLoading && <div>Loading...</div>}
            {user && (
                <div>
                    <Button asChild variant="link">
                        <Link href="/profile" className="flex items-center gap-1">
                            <User size={16} />
                            {user.username}
                        </Link>
                    </Button>
                    <Button onClick={() => logout()}>Sign out</Button>
                </div>
            )}
            {!user && !isLoading && (
                <Button asChild variant="link">
                    <Link href="/login">Sign in</Link>
                </Button>
            )}
        </nav>
    )
}
