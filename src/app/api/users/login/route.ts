import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { loginInputSchema } from "~/app/login/validation"
import { USER_TOKEN } from "~/lib/constants"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"

// runtime edge on dev environment crashes because of bcrypt
export const runtime = "edge"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const credentials = loginInputSchema.parse(body)

        const { email, password } = credentials.user

        const user = await authService.verifyCredentials(email, password)

        const safeUser = {
            email: user.email,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        const token = await authService.createToken(safeUser)

        //@ts-ignore
        safeUser.token = token

        //@ts-ignore
        cookies().set(USER_TOKEN, token, { secure: true })

        return jsonResponse(200, { user: safeUser })
    } catch (error) {
        return jsonResponse(400, { message: (error as Error).message })
    }
}

