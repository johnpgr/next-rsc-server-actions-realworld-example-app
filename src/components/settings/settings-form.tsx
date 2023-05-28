"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { updateUserAction } from "~/modules/users/users.actions"
import { UpdateUser, User } from "~/modules/users/users.types"
import { getFormData } from "~/utils/forms"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Dot } from "lucide-react"
import { Spinner } from "../spinner"

export const SettingsForm = (props: { user: User }) => {
    const router = useRouter()
    const { data: session } = useSession()
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
        if(data.email === props.user.email) delete data.email
        //@ts-ignore
        if(data.username === props.user.name) delete data.username
        //@ts-ignore
        if(data.bio === props.user.bio) delete data.bio
        //@ts-ignore
        if(data.image === props.user.image) delete data.image

        const res = await updateUserAction({
            user: data,
            session,
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {error && (
                <p className="flex items-center text-sm font-medium text-red-700">
                    <Dot size={28} />
                    {error}
                </p>
            )}
            <div>
                <Label>URL of profile picture</Label>
                <Input
                    name="image"
                    defaultValue={props.user.image ?? undefined}
                />
            </div>
            <div>
                <Label>Username</Label>
                <Input
                    name="username"
                    defaultValue={props.user.name ?? undefined}
                />
            </div>
            <div>
                <Label>Bio</Label>
                <Textarea
                    name="bio"
                    defaultValue={props.user.bio ?? undefined}
                />
            </div>

            <div>
                <Label>Email</Label>
                <Input
                    type="email"
                    name="email"
                    defaultValue={props.user.email ?? undefined}
                />
            </div>

            <div>
                <Label>New password</Label>
                <Input type="password" name="password" />
            </div>
            <Button className="ml-auto mt-2 w-fit" disabled={isPending}>
                {isPending ? <Spinner /> : null}
                Update settings
            </Button>
        </form>
    )
}
