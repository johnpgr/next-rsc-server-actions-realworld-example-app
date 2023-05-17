"use client"
import { Button } from "~/components/ui/button"
import { useState } from "react"
import Cookies from "js-cookie"
import { getBaseUrl } from "~/lib/utils"
import { CurrentUserResponse } from "~/app/api/user/validation"
import { USER_TOKEN } from "~/lib/constants"

export const UserButton = () => {
    const [user, setUser] = useState<CurrentUserResponse | null>(null)

    return (
        <div>
            <Button
                onClick={async () => {
                    const token = Cookies.get(USER_TOKEN)
                    if (!token) {
                        alert("No token found")
                        return
                    }

                    const user = await fetch(`${getBaseUrl()}/api/user`, {
                        method: "GET",
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                        next: {
                            revalidate: 0,
                        },
                    }).then((res) => res.json() as Promise<CurrentUserResponse>)

                    setUser(user)
                }}
            >
                Fetch user
            </Button>
            <pre>{JSON.stringify(user, null, 4)}</pre>
        </div>
    )
}
