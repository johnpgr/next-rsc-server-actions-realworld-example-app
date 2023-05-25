"use server"
import { createSafeActionClient } from "next-safe-action"
import { getServerSession } from "next-auth"
import { authOptions } from "~/modules/auth/auth.options"

export async function getAuthData() {
    const session = await getServerSession(authOptions)
    return { session }
}

export const action = createSafeActionClient({
    serverErrorLogFunction: console.error,
    getAuthData,
})
