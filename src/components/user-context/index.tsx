"use client"
import React, { cache, use } from "react"
import Cookies from "js-cookie"
import { getBaseUrl } from "~/lib/utils"
import {
    CurrentUserResponse,
    getCurrentUserResponseSchema,
} from "~/app/api/user/(get-user)/validation"
import { JWT_EXPIRATION_TIME, USER_TOKEN } from "~/lib/constants"
import { SafeUser } from "~/types/user"

export type UserContextType = {
    user: SafeUser | null
    isLoading: boolean
    login: (user: SafeUser) => void
    logout: () => void
}

export const UserContext = React.createContext<UserContextType>(
    {} as UserContextType,
)

const fetchUser = cache(async (token: string) => {
    return fetch(`${getBaseUrl()}/api/user`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        next: { revalidate: 0 },
    }).then((res) => res.json() as Promise<CurrentUserResponse>)
})

export const UserContextProvider = (props: { children: React.ReactNode }) => {
    const [user, setUser] = React.useState<SafeUser | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const token = Cookies.get(USER_TOKEN)
    const res = token ? use(fetchUser(token)) : null

    function login(user: SafeUser) {
        const expiration = new Date(
            Date.now() + JWT_EXPIRATION_TIME.seconds * 1000,
        )

        Cookies.set(USER_TOKEN, user.token, {
            expires: expiration,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        })

        setUser(user)
    }

    function logout() {
        Cookies.remove(USER_TOKEN)
        setUser(null)
    }

    React.useEffect(() => {
        async function getUser(): Promise<void> {
            try {
                setIsLoading(true)

                if (!token || !res) {
                    setIsLoading(false)
                    return
                }

                const parsed = getCurrentUserResponseSchema.parse(res)

                if (!parsed.success) return

                setUser(parsed.user)
                setIsLoading(false)
            } catch (error) {
                console.error(error)
            }
        }

        getUser()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
            }}
        >
            {props.children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const ctx = React.useContext(UserContext)

    if (!ctx)
        throw new Error("useUser must be used within a UserContextProvider")

    return ctx
}
