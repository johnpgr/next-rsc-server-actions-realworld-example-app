import { type NextRequest, NextResponse } from "next/server"
import { authService } from "~/services/auth"
import { USER_TOKEN } from "./lib/constants"

const protectedPages = ["/api/protected", "/protected"]
const unavailablePagesForAuthedUsers = ["/login", "/register"]

export const config = {
    matcher: ["/api/protected", "/protected", "/login", "/register"],
}

function protectedPagesRedirect(req: NextRequest) {
    if (protectedPages.includes(req.nextUrl.pathname)) {
        if (req.nextUrl.pathname.startsWith("/api/")) {
            return new NextResponse(
                JSON.stringify({
                    error: { message: "authentication required" },
                }),
                { status: 401 },
            )
        } else {
            return NextResponse.redirect(new URL("/login", req.url))
        }
    }
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(USER_TOKEN)?.value

    if (!token) {
        return protectedPagesRedirect(req)
    }

    const user = await authService.getPayloadFromToken(token)

    if (!user) {
        return protectedPagesRedirect(req)
    }

    if (unavailablePagesForAuthedUsers.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/", req.url))
    }
}
