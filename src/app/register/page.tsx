"use client"
import { Dot, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { getFormData } from "~/lib/utils"
import { registerAction } from "./actions"
import { passwordRegex } from "./validation"

export const runtime = "edge"

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const [passwordError, setPasswordError] = useState<string | undefined>()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const input = getFormData<{
            email: string
            username: string
            password: string
        }>(e)

        const user = {
            email: input.email,
            username: input.username,
            password: input.password,
        }

        const { data } = await registerAction({ user })

        if (!data) {
            setError(
                "Something went wrong creating your account, try again later",
            )
            setIsPending(false)
            return
        }

        if (!data.success) {
            setError(data.message)
            setIsPending(false)
            return
        }

        router.push("/")
        setIsPending(false)
    }

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
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Input name="username" type="text" placeholder="Username" />
                <Input name="email" type="email" placeholder="Email" />
                <Input
                    name="password"
                    onBlur={(e) => {
                        const valid = passwordRegex.test(e.currentTarget.value)
                        if (!valid)
                            setPasswordError(
                                "Password must be at least 8 characters long, contain at least one uppercase letter, one number and one special character.",
                            )
                        else setPasswordError(undefined)
                    }}
                    type="password"
                    placeholder="Password"
                />
                {passwordError && (
                    <p className="-mt-2 text-xs text-red-700">
                        {passwordError}
                    </p>
                )}
                <Button className="ml-auto w-fit gap-1" disabled={isPending}>
                    {isPending && (
                        <Loader2
                            size={14}
                            className="animate-spin text-white"
                        />
                    )}
                    Sign Up
                </Button>
            </form>
        </div>
    )
}
