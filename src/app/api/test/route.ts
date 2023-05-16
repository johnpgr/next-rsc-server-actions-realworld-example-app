import { NextRequest } from "next/server"
import { comparePasswords,  hashPassword } from "~/lib/crypto"
import { jsonResponse } from "~/lib/utils"

export async function POST(req: NextRequest) {
    const { password } = await req.json()
    console.time("crypto")
    const { hashedPassword, salt } = await hashPassword(password)
    const valid = await comparePasswords(password, hashedPassword, salt)
    console.timeEnd("crypto")

    return jsonResponse(200, { password, hashedPassword, valid })
}
