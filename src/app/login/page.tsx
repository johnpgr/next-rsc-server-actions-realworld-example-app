"use client"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Dot, Loader2 } from "lucide-react"
import { loginAction } from "./action"
import { getFormData } from "~/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { JWT_EXPIRATION_TIME, USER_TOKEN } from "~/lib/constants"

export const runtime = "edge"

export default function LoginPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | undefined>()

    return (
        <div className="container mx-auto mt-16 flex max-w-xl flex-col gap-4">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-4xl">Sign In</h1>
                <Link href="/register" className="text-sm text-green-600">
                    Need an account?
                </Link>
            </div>
            {error && (
                <p className="flex items-center text-sm font-medium text-red-700">
                    <Dot size={28} />
                    {error}
                </p>
            )}
            <form
                onSubmit={async (e) => {
                    setIsPending(true)
                    e.preventDefault()

                    const input = getFormData<{
                        email: string
                        password: string
                    }>(e)

                    const user = {
                        email: input.email,
                        password: input.password,
                    }

                    const { data } = await loginAction({ user })

                    if (data && "message" in data) {
                        setError(data.message)
                        setIsPending(false)
                    } else if (data && "user" in data) {
                        Cookies.set(USER_TOKEN, data.user.token, {
                            expires: JWT_EXPIRATION_TIME.seconds,
                            sameSite: "strict",
                            secure: process.env.NODE_ENV === "production",
                        })
                        router.push("/")
                        setIsPending(false)
                    } else {
                        setError("Something went wrong")
                    }
                }}
                className="flex flex-col gap-4"
            >
                <Input name="email" type="email" placeholder="Email" />
                <Input name="password" type="password" placeholder="Password" />
                <Button className="ml-auto w-fit gap-1" disabled={isPending}>
                    {isPending && (
                        <Loader2
                            size={14}
                            className="animate-spin text-white"
                        />
                    )}
                    Sign In
                </Button>
            </form>
        </div>
    )
}
