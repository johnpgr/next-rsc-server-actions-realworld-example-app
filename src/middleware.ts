import { type NextRequest, NextResponse } from "next/server"
import { authService } from "~/services/auth"

export const config = {
    matcher: ["/api/protected", "/protected"],
}

export async function middleware(req: NextRequest) {
    // validate the user is authenticated
    const token = req.headers.get("authorization")?.split("Token ")[1]
    const user = await authService.verifyToken(token || "")

    if (!user) {
        // if this an API request, respond with JSON
        if (req.nextUrl.pathname.startsWith("/api/")) {
            return new NextResponse(
                JSON.stringify({
                    error: { message: "authentication required" },
                }),
                { status: 401 },
            )
        }
        // otherwise, redirect to the set token page
        else {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }
}
