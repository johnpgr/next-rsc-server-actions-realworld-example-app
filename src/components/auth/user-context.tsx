'use client'
import React from 'react'
import Cookies from 'js-cookie'
import { USER_TOKEN } from '~/config/constants'
import { UserJWTPayload } from '~/modules/auth/auth.types'
import { fetchUser } from './fetch-user'

export type UserContextType = {
    user: UserJWTPayload | null
    login: (user: UserJWTPayload) => void
    logout: () => void
}

export const UserContext = React.createContext<UserContextType>(
    {} as UserContextType,
)

export const UserContextProvider = (props: {
    children: React.ReactNode
    initial?: UserJWTPayload | null
}) => {
    const [user, setUser] = React.useState<UserJWTPayload | null>(
        props.initial ?? null,
    )
    const token = Cookies.get(USER_TOKEN)
    const res = token && !user ? React.use(fetchUser(token)) : null

    function login(user: UserJWTPayload) {
        setUser(user)
    }

    function logout() {
        Cookies.remove(USER_TOKEN)
        setUser(null)
    }

    React.useEffect(() => {
        async function getUser(): Promise<void> {
            try {
                if (!token || !res) return
                setUser(res.user)
            } catch (error) {
                console.error(error)
            }
        }

        getUser()
    }, [token, res])

    return (
        <UserContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {props.children}
        </UserContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = React.useContext(UserContext)

    if (!ctx)
        throw new Error('useUser must be used within a UserContextProvider')

    return ctx
}
