import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"

// runtime edge on dev environment crashes because of bcrypt
export const runtime = "edge"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]

        const user = await authService.verifyToken(token || "")

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
        return jsonResponse(401, { message: (error as Error).message })
    }
}
