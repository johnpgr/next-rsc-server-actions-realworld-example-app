import { NextRequest } from "next/server"
import { env } from "process"
import { z } from "zod"
import { jsonResponse } from "~/lib/utils"
import { authService } from "~/services/auth"

// runtime edge on dev environment crashes because of bcrypt
export const runtime = env.NODE_ENV === "production" ? "edge" : "nodejs"

const credentialsBodySchema = z
    .object({
        user: z.object({
            email: z.string().email(),
            password: z.string(),
        }),
    })
    .strict()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const credentials = credentialsBodySchema.parse(body)

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

        return jsonResponse(200, { user: safeUser })
    } catch (error) {
        return jsonResponse(400, { message: (error as Error).message })
    }
}
