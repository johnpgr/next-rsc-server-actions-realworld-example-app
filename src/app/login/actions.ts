"use server"
import { getBaseUrl, action } from "~/lib/utils"
import { loginInputSchema } from "./validation"
import {
    LoginResponse,
    loginResponseSchema,
} from "~/app/api/users/login/validation"

export const loginAction = action({ input: loginInputSchema }, async (data) => {
    const res = await fetch(`${getBaseUrl()}/api/users/login`, {
        method: "POST",
        body: JSON.stringify(data),
        next: {
            revalidate: 0,
        },
    })

    const json = (await res.json()) as LoginResponse

    const parsed = loginResponseSchema.parse(json)

    return parsed
})
