import { getBaseUrl, validatedAction } from "~/lib/utils"
import { registerInputSchema } from "./validation"
import {
    registerResponseSchema,
} from "~/app/api/users/validation"

export const registerAction = validatedAction(
    { input: registerInputSchema },
    async (data) => {
        console.log("registerAction", data)
        return await fetch(`${getBaseUrl()}/api/users`, {
            method: "POST",
            body: JSON.stringify(data),
        }).then(async (res) => registerResponseSchema.parse(await res.json()))
    },
)
