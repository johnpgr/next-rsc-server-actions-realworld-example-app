import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Edit, Home } from "lucide-react"
import UserButton from "./auth/user-button"
import { HEADER_HEIGHT } from "~/config/constants"
import { type Session } from "next-auth"
import { Titillium_Web } from "next/font/google"
import { cn } from "~/utils/cn"

const titilliumWeb = Titillium_Web({
    weight: ["700"],
    subsets: ["latin"],
    fallback: ["sans-serif"],
})

export const Nav = (props: { session: Session | null }) => {
    const { session } = props
    return (
        <nav
            className="mx-auto flex w-full max-w-6xl items-center justify-between bg-background px-4"
            style={{ height: HEADER_HEIGHT }}
        >
            <Link
                href="/"
                className={cn(
                    "h-fit w-fit p-0 text-2xl font-bold text-primary focus:outline-ring rounded-lg",
                    titilliumWeb.className,
                )}
            >
                conduit
            </Link>
            <div className="flex items-center gap-4">
                <Button asChild variant="link" className="h-fit w-fit p-0 gap-1">
                    <Link href="/">
                        <Home size={16} />
                        Home
                    </Link>
                </Button>
                {session && session.user && (
                    <div className="flex items-center">
                        <Button
                            asChild
                            variant="link"
                            className="h-fit w-fit p-0 gap-1"
                        >
                            <Link href="/editor">
                                <Edit size={16} />
                                New Article
                            </Link>
                        </Button>
                        <UserButton session={session} />
                    </div>
                )}
                {!session && (
                    <div className="flex items-center gap-4">
                        <Button
                            asChild
                            variant="link"
                            className="h-fit w-fit p-0"
                        >
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button
                            asChild
                            variant="link"
                            className="h-fit w-fit p-0"
                        >
                            <Link href="/register">Sign up</Link>
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    )
}
