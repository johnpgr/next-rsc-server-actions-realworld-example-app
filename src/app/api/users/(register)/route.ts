import { NextRequest } from 'next/server'
import { registerInputSchema } from '~/app/register/validation'
import { DEFAULT_USER_IMAGE } from '~/lib/constants'
import { jsonResponse } from '~/lib/utils'
import { authService } from '~/services/auth'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const registration = registerInputSchema.parse(body)

        const { email, password, username } = registration.user

        const user = await authService.registerUser({
            email,
            password,
            username,
            image: DEFAULT_USER_IMAGE
        })

        const safeUser = {
            email: user.email,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        const token = await authService.createToken(safeUser)

        //@ts-ignore
        safeUser.token = token

        return jsonResponse(200, {
            user: safeUser,
        })
    } catch (error) {
        return jsonResponse(400, {
            errors: { body: [(error as Error).message] },
        })
    }
}
