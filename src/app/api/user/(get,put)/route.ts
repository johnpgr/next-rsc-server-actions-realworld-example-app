import { NextRequest } from "next/server"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"
import { editUserInputSchema } from "~/app/profile/(edit-user)/validation"
import { errors } from "jose"
import { ZodError } from "zod"

// runtime edge on dev environment crashes because of bcrypt
export const runtime = "edge"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)

        if (!user) throw new Error("Token expired")

        const safeUser = {
            id: user.id,
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
        if (error instanceof errors.JWTExpired)
            return jsonResponse(401, {
                success: false,
                message: "Token expired",
            })
        return jsonResponse(401, {
            success: false,
            message: (error as Error).message,
        })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split("Token ")[1]
        if (!token) throw new Error("Unauthorized")

        const user = await authService.getPayloadFromToken(token)
        if(!user) throw new Error("Token expired")

        const input = await req.json()
        const parsed = editUserInputSchema.parse(input)

        console.log({ id: user.id })
        //@ts-ignore
        parsed.id = user.id

        //@ts-ignore
        const updatedUser = await authService.updateUser(parsed)

        const safeUser = {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            bio: updatedUser.bio,
            image: updatedUser.image,
        }

        const newToken = await authService.createToken(safeUser)

        //@ts-ignore
        safeUser.token = newToken

        return jsonResponse(200, {
            success: true,
            user: safeUser,
        })
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            return jsonResponse(401, {
                success: false,
                message: "Token expired",
            })
        }

        if (error instanceof ZodError) {
            return jsonResponse(401, {
                success: false,
                message: error.issues.map((issue) => issue.message).join(", "),
            })
        }

        console.dir(error)
        return jsonResponse(401, {
            success: false,
            message: (error as Error).message,
        })
    }
}
