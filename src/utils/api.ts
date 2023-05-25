import { NextResponse } from "next/server"
import { env } from "~/config/env.mjs"

/**
 * Returns a Response object with a JSON body
 */
export function jsonResponse(status: number, data: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(data), {
        ...init,
        status,
        headers: {
            ...init?.headers,
            "Content-Type": "application/json",
        },
    })
}

/**
 * Returns the base URL of the application
 */
export function getBaseUrl(): string {
    // vercel deployment url or localhost
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000"
    } else {
        return env.NEXT_PUBLIC_VERCEL_URL
    }
}
