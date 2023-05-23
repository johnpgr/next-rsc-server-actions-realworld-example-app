'use server'
import { createSafeActionClient } from 'next-safe-action'
import { cookies } from 'next/headers'
import { USER_TOKEN } from '../constants'
import { authService } from '~/services/auth'

export async function getAuthData() {
    const token = cookies().get(USER_TOKEN)?.value

    if (!token) return { user: null }

    const user = await authService.getPayloadFromToken(token)

    return { user }
}

export const action = createSafeActionClient({
    serverErrorLogFunction: console.error,
    getAuthData,
})


