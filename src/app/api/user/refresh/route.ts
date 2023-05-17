import { NextRequest } from "next/server";
import { jsonResponse } from "~/lib/utils";
import { authService } from "~/services/auth";

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function POST(req:NextRequest){
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if(!token) return jsonResponse(401, { message: "Unauthorized" })

        const newToken = await authService.refreshToken(token)

        return jsonResponse(200, { token: newToken })
    } catch (error) {
       return jsonResponse(401, { message: (error as Error).message }) 
    }
}
