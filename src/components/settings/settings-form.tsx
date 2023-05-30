"use client"

import { Dot } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { updateUserAction } from "~/modules/users/users.actions"
import { UpdateUser, User } from "~/modules/users/users.types"
import { getFormData } from "~/utils/forms"
import { Spinner } from "../spinner"

export const SettingsForm = (props: { user: User }) => {
    const router = useRouter()
    const [error, setError] = useState("")
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setIsPending(true)

        const data = getFormData<UpdateUser["user"]>(e)

        // remove empty strings from data
        for (const val in data) {
            //@ts-ignore
            if (data[val] === "") delete data[val]
        }

        //@ts-ignore
        if (data.email === props.user.email) delete data.email
        //@ts-ignore
        if (data.username === props.user.name) delete data.username
        //@ts-ignore
        if (data.bio === props.user.bio) delete data.bio
        //@ts-ignore
        if (data.image === props.user.image) delete data.image

        const res = await updateUserAction({
            user: data,
        })

        if (res.validationError?.user) {
            setError(res.validationError.user.join(","))
            setIsPending(false)
            return
        }

        if (res?.data?.error) {
            setError(res.data.error.message)
            setIsPending(false)
            return
        }

        router.refresh()
        router.push(`/profile/${res.data?.user?.name}`)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <p className="flex items-center text-sm font-medium text-red-700">
                    <Dot size={28} />
                    {error}
                </p>
            )}
            <Input
                name="image"
                placeholder="URL of profile picture"
                defaultValue={props.user.image ?? undefined}
            />
            <Input
                name="username"
                placeholder="Username"
                defaultValue={props.user.name ?? undefined}
            />
            <Textarea name="bio" defaultValue={props.user.bio ?? undefined} />

            <Input
                type="email"
                name="email"
                placeholder="Email"
                defaultValue={props.user.email ?? undefined}
            />

            <Input type="password" placeholder="New password" name="password" />
            <Button className="ml-auto mt-2 w-fit gap-1" disabled={isPending}>
                {isPending ? <Spinner size={16} /> : null}
                Update settings
            </Button>
        </form>
    )
}
