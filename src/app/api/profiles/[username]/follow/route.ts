import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"
import { profileService } from "~/services/profile"

export const runtime = "edge"

export async function POST(
    req: NextRequest,
    { params }: { params: { username: string } },
) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)
        if (!user) throw new Error("Token expired")

        const profile = await profileService.followUser(
            user.username,
            params.username,
        )

        return jsonResponse(200, { success: true, profile })
    } catch (error) {
        if ((error as Error).message.startsWith("Already following user")) {
            return jsonResponse(422, { error: (error as Error).message })
        }

        return jsonResponse(401, {
            success: false,
            message: (error as Error).message,
        })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { username: string } },
) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)
        if (!user) throw new Error("Token expired")

        const profile = await profileService.unfollowUser(
            user.username,
            params.username,
        )

        return jsonResponse(200, { success: true, profile })
    } catch (error) {
        return jsonResponse(401, {
            success: false,
            message: (error as Error).message,
        })
    }
}
