import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "~/modules/auth/auth.options"

export const UnauthRequiredPage = async ({
    children,
}: {
    children: React.ReactNode
}) => {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) return <>{children}</>

    redirect("/")
}
