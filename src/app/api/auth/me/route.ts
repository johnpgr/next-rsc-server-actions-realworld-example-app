import { NextRequest } from "next/server"
import { authService } from "~/modules/auth/auth.service"
import { jsonResponse } from "~/utils/api"

export const runtime = "edge"

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1]

    if (!token) return jsonResponse(400, { message: "No token provided" })

    const user = await authService.getPayloadFromToken(token)

    return jsonResponse(200, { user })
}
