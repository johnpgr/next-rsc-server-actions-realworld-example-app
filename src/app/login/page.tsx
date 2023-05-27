"use client"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Dot, Loader2 } from "lucide-react"
import { getFormData } from "~/utils/forms"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | undefined>()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const input = getFormData<{
            email: string
            password: string
        }>(e)

        const user = {
            email: input.email,
            password: input.password,
        }

        const res = await signIn("credentials", {
            redirect: false,
            email: user.email,
            password: user.password,
        })

        if (res?.error) {
            setError("Invalid email or password")
            setIsPending(false)
            return
        }


        //Refresh here is for the root layout to update the session
        router.refresh()
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
