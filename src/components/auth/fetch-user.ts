import { cache } from "react"
import { UserJWTPayload } from "~/modules/auth/auth.types"
import { getBaseUrl } from "~/utils/api"

export const fetchUser = cache(async (token: string) => {
    const res = await fetch(`${getBaseUrl()}/api/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        cache: "no-store",
    })

    const json = (await res.json()) as {
        user: UserJWTPayload | null
    }

    return { user: json.user }
})
