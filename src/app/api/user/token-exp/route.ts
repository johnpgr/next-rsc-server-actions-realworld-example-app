import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"
import { errors as ERRORS } from "jose"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]

        if (!token)
            return jsonResponse(401, {
                error: true,
                message: "Token not found",
                code: "ERR_TOKEN_NOTFOUND",
            })

        const user = await authService.getPayloadFromToken(token)
        if(!user) throw new Error("Token expired")

        return jsonResponse(200, {
            success: true,
            exp: user.exp,
        })
    } catch (error) {

        return jsonResponse(401, {
            error: true,
            message: (error as Error).message,
        })
    }
}
