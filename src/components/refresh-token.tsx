"use client"

import { JWT_EXPIRATION_TIME, USER_TOKEN } from "~/lib/constants"
import Cookies from "js-cookie"
import { cache, use, useEffect, useRef } from "react"
import { ErrorWithCode, getBaseUrl } from "~/lib/utils"
import { TokenValidationResponse } from "~/app/api/user/refresh/validation"
import {
    JWT_ERROR_CODES,
    TokenExpResponse,
} from "~/app/api/user/token-exp/validation"
import { useUser } from "./user-context"

function updateToken(token: string) {
    const expiration = new Date(Date.now() + JWT_EXPIRATION_TIME.seconds * 1000)


    Cookies.set(USER_TOKEN, token, {
        expires: expiration,
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

        if (!data.success) throw new ErrorWithCode(data.message, data.code)

        // Calculate the remaining time until expiration
        const currentTime = Math.floor(Date.now() / 1000) // Convert current time to seconds
        const remainingTime = data.exp - currentTime

        return remainingTime
    } catch (error) {
        if (error instanceof ErrorWithCode) {
            if (error.code === JWT_ERROR_CODES.ERR_JWT_EXPIRED) {
                // If the token is expired, return 0
                return 0
            }
            if (error.code === JWT_ERROR_CODES.ERR_TOKEN_NOTFOUND) {
                // If the token is not found, return the default expiration time
                return JWT_EXPIRATION_TIME.seconds
            }
        }
        throw new Error("Error calculating expiration time")
    }
}

const fetchInitialExpTime = cache((token: string) =>
    calculateExpirationTime(token),
)

export const RefreshTokenComponent = () => {
    const { user } = useUser()
    const timeoutRef = useRef<any>(null)

    const initialExpTime = user?.token
        ? use(fetchInitialExpTime(user.token))
        : JWT_EXPIRATION_TIME.seconds

    async function refreshToken() {
        if (!user) return
        try {
            // Get a new token
            const res = await fetch(`${getBaseUrl()}/api/user/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${user.token}`,
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
            console.error(error)
        }
    }

    // Function to start the token refresh process
    function startTokenRefresh(expTime: number) {
        const refreshTime = expTime * 0.8

        timeoutRef.current = setTimeout(refreshToken, refreshTime * 1000)
    }

    useEffect(() => {
        if (!user || !user.token) return

        startTokenRefresh(initialExpTime)

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutRef.current)
        }
    }, [user])

    return null
}
