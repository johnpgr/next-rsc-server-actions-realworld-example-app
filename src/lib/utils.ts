import { NextResponse } from "next/server"
import { decodeTime, ulidFactory } from "ulid-workers"
import { createSafeActionClient } from "next-safe-action"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FormEvent } from "react"
import { env } from "~/config/env.mjs"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

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

export const action = createSafeActionClient({
    serverErrorLogFunction: console.error,
})

export function getFormData<T extends object>(
    e: FormEvent<HTMLFormElement>,
): T {
    const formData = new FormData(e.currentTarget)
    const input = Object.fromEntries(formData.entries()) as unknown as T
    return input
}

export function createId(): string {
    const ulid = ulidFactory({ monotonic: true })
    return ulid()
}

export function getDateFromULID(ulid:string){
    return new Date(decodeTime(ulid))
}
