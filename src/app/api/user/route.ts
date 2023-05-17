import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"

// runtime edge on dev environment crashes because of bcrypt
export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)

        const safeUser = {
            email: user.email,
            token,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        return jsonResponse(200, {
            success: true,
            user: safeUser,
        })
    } catch (error) {
        return jsonResponse(401, {
            success: false,
            message: (error as Error).message,
        })
    }
}
