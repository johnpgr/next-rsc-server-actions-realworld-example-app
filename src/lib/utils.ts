import { NextResponse } from "next/server"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
