"use client"

import { JWT_EXPIRATION_TIME, USER_TOKEN } from "~/lib/constants"
import Cookies from "js-cookie"
import { cache, use, useEffect, useMemo, useRef } from "react"
import { getBaseUrl } from "~/lib/utils"
import { TokenValidationResponse } from "~/app/api/user/refresh/validation"
import { TokenExpResponse } from "~/app/api/user/token-exp/validation"

function updateToken(token: string) {
    Cookies.set(USER_TOKEN, token, {
        expires: JWT_EXPIRATION_TIME.seconds,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })
}

async function calculateExpirationTime(token: string) {
    try {
        const data = await fetch(`${getBaseUrl()}/api/user/token-exp`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            next: { revalidate: 0 },
        }).then((res) => res.json() as Promise<TokenExpResponse>)

        if ("message" in data) throw new Error("Unauthorized")

        // Calculate the remaining time until expiration
        const currentTime = Math.floor(Date.now() / 1000) // Convert current time to seconds
        const remainingTime = data.exp - currentTime

        return remainingTime
    } catch (error) {
        console.error(
            "Error calculating expiration time:",
            (error as Error).message,
        )
        throw new Error("Error calculating expiration time")
    }
}

const fetchInitialExpTime = cache((token: string) =>
    calculateExpirationTime(token),
)

export const RefreshTokenComponent = () => {
    const token = Cookies.get(USER_TOKEN)

    const initialExpTime = token
        ? use(fetchInitialExpTime(token))
        : JWT_EXPIRATION_TIME.seconds

    const timeoutRef = useRef<any>(null)

    async function refreshToken() {
        console.log("Refreshing token")
        try {
            // Get a new token
            const res = await fetch(`${getBaseUrl()}/api/user/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                next: { revalidate: 0 },
            })

            const json = (await res.json()) as TokenValidationResponse

            if ("message" in json) throw new Error("Unauthorized")

            const newToken = json.token

            // Update the token
            updateToken(newToken)

            //Calculate the remaining expiration time for the new access token
            const newExp = await calculateExpirationTime(newToken)

            // Restart the token refresh process with the new access token
            startTokenRefresh(newExp)
        } catch (error) {
            console.error("Error refreshing token:", (error as Error).message)
            throw new Error("Error refreshing token")
        }
    }

    // Function to start the token refresh process
    function startTokenRefresh(expTime: number) {
        const refreshTime = expTime * 0.8

        timeoutRef.current = setTimeout(refreshToken, refreshTime * 1000)
    }

    useEffect(() => {
        if (!token) return
        // Start the initial token refresh process
        startTokenRefresh(initialExpTime)
        console.log("Initial token refresh started", { initialExpTime })

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutRef.current)
        }
    }, [])

    return null
}
