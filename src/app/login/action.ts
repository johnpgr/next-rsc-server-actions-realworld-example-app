import { getBaseUrl, validatedAction } from "~/lib/utils"
import { loginInputSchema } from "./validation"
import { loginResponseSchema } from "~/app/api/users/login/validation"

export const loginAction = validatedAction(
    { input: loginInputSchema },
    async (data) => {
        return await fetch(`${getBaseUrl()}/api/users/login`, {
            method: "POST",
            body: JSON.stringify(data),
        }).then(async (res) => loginResponseSchema.parse(await res.json()))
    },
)
