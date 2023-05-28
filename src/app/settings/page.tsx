import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { SettingsForm } from "~/components/settings/settings-form"
import { authOptions } from "~/modules/auth/auth.options"
import { usersService } from "~/modules/users/users.service"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) redirect("/login")

    const user = await usersService.getUser(session?.user?.id)

    if (!user) redirect("/login")

    return (
        <div className="w-full max-w-3xl mx-auto">
            <h1 className="text-[40px] text-center">Your settings</h1>
            <SettingsForm user={user} />
        </div>
    )
}
