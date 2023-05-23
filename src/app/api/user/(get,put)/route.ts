import { NextRequest } from 'next/server'
import { defaultErrorMessage, errorBody, jsonResponse } from '~/lib/utils'
import { authService } from '~/services/auth'
import { editUserInputSchema } from '~/app/profile/(edit-user)/validation'
import { ZodError } from 'zod'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split('Token ')[1]
        if (!token) throw new Error('Unauthorized')

        const user = await authService.getPayloadFromToken(token)

        if (!user) throw new Error('Token expired')

        const safeUser = {
            email: user.email,
            token,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        return jsonResponse(200, {
            user: safeUser,
        })
    } catch (error) {
        return jsonResponse(401, errorBody([defaultErrorMessage(error)]))
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split('Token ')[1]
        if (!token) throw new Error('Unauthorized')

        const user = await authService.getPayloadFromToken(token)
        if (!user) throw new Error('Token expired')

        const input = await req.json()
        const parsed = editUserInputSchema.parse(input)

        const updatedUser = await authService.updateUser(user.username, parsed)

        const safeUser = {
            email: updatedUser.email,
            username: updatedUser.username,
            bio: updatedUser.bio,
            image: updatedUser.image,
        }

        const newToken = await authService.createToken(safeUser)

        //@ts-ignore
        safeUser.token = newToken

        return jsonResponse(200, {
            user: safeUser,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return jsonResponse(
                422,
                errorBody(error.issues.map((issue) => issue.message)),
            )
        }

        return jsonResponse(401, errorBody([defaultErrorMessage(error)]))
    }
}
