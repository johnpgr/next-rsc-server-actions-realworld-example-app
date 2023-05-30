"use server"
import { createSafeActionClient } from "next-safe-action"
import { getToken } from "next-auth/jwt"
import { env } from "~/config/env"
import { cookies } from "next/headers"
import { type NextRequest } from "next/server"

async function getAuthData() {
    const _cookies = cookies()

    const req = new Request(env.NEXTAUTH_URL)

    //@ts-ignore
    req.cookies = _cookies

    const token = await getToken({
        req: req as NextRequest & { cookies: Record<string, string> },
    })

    return {
        session: {
            user: token
                ? {
                      id: token.id,
                      email: token.email,
                      name: token.name,
                      image: token.image,
                  }
                : null,
        },
    }
}
export const action = createSafeActionClient({
    getAuthData,
})
