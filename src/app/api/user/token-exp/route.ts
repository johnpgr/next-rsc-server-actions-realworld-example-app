import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)

        return jsonResponse(200, {
            exp: user.exp,
        })
    } catch (error) {
        return jsonResponse(401, { message: (error as Error).message })
    }
}
