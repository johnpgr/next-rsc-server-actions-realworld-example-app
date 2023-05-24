import { NextRequest } from 'next/server'
import { jsonResponse } from '~/utils/api'
import { authService } from '~/modules/auth/auth.service'
import { cookies } from 'next/headers'
import { USER_TOKEN } from '~/config/constants'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Token ')[1]
    if (!token) return jsonResponse(401, { message: 'Unauthorized' })

    try {
        const newToken = await authService.refreshToken(token)
        const user = await authService.getPayloadFromToken(newToken)
        if (!user) throw new Error('Something went wrong refreshing the token')

        cookies().set(USER_TOKEN, newToken)

        return jsonResponse(200, { exp: user.exp })
    } catch (error) {
        return jsonResponse(401, {
            message: (error as Error).message,
        })
    }
}
