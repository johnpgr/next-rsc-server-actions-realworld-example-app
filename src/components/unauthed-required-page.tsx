import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { USER_TOKEN } from "~/lib/constants"
import { authService } from "~/services/auth"

export const UnauthRequiredPage = async ({
    children,
}: {
    children: React.ReactNode
}) => {
    const token = cookies().get(USER_TOKEN)?.value

    if (!token) return <>{children}</>

    const isTokenValid = await authService.getPayloadFromToken(token)

    if (isTokenValid) redirect("/")

    return <>{children}</>
}
