import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"
import { profileService } from "~/services/profile"

export async function GET(
    req: NextRequest,
    { params }: { params: { username: string } },
) {
    try {
        let currentUser: string | undefined = undefined

        const token = req.headers.get("authorization")?.split("Token ")[1]

        if (token) {
            const user = await authService.getPayloadFromToken(token)
            if (user) {
                currentUser = user.username
            }
        }

        const profile = await profileService.getProfile(
            params.username,
            currentUser,
        )

        return jsonResponse(200, { profile })
    } catch (error) {
        console.dir(error)
        return jsonResponse(500, { error: (error as Error).message })
    }
}
