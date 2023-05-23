import { NextRequest } from 'next/server'
import { jsonResponse } from '~/lib/utils'
import { authService } from '~/services/auth'
import { profileService } from '~/services/profile'

export const runtime = 'edge'

export async function GET(
    req: NextRequest,
    { params }: { params: { username: string } },
) {
    try {
        let currentUsername: string | undefined = undefined

        const token = req.headers.get('authorization')?.split('Token ')[1]

        if (token) {
            const user = await authService.getPayloadFromToken(token)
            if (user) {
                currentUsername = user.username
            }
        }

        const profile = await profileService.getProfile(
            params.username,
            currentUsername,
        )

        return jsonResponse(200, { profile })
    } catch (error) {
        return jsonResponse(500, {
            errors: { body: [(error as Error).message] },
        })
    }
}
