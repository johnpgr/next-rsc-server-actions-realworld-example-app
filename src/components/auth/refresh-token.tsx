'use client'

import { USER_TOKEN } from '~/config/constants'
import Cookies from 'js-cookie'
import { cache, use, useEffect, useRef } from 'react'
import { getBaseUrl } from '~/utils/api'
import { useAuth } from './user-context'

const getNewToken = cache(
    async (token: string) =>
        await fetch(`${getBaseUrl()}/api/auth/token/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            cache: 'no-store',
        }),
)

function calculateExpirationTime(exp: number) {
    const now = Date.now() / 1000
    const expTime = exp - now
    return expTime
}

export const RefreshTokenComponent = () => {
    const { user } = useAuth()
    const token = Cookies.get(USER_TOKEN)
    const timeoutRef = useRef<any>(null)

    async function refreshToken() {
        if (!user || !token) return
        try {
            // Get a new token
            const res = use(getNewToken(token))

            const { exp: newExp } = (await res.json()) as {
                exp: number
            }

            // Restart the token refresh process with the new access token
            startTokenRefresh(newExp)
        } catch (error) {
            console.error(error)
        }
    }

    // Function to start the token refresh process
    function startTokenRefresh(expTime: number) {
        const refreshTime = expTime * 0.8

        timeoutRef.current = setTimeout(refreshToken, refreshTime * 1000)
    }

    useEffect(() => {
        if (!user) return

        startTokenRefresh(calculateExpirationTime(user.exp))

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutRef.current)
        }
    }, [user])

    return null
}
