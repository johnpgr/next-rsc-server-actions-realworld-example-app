"use server"
import { action } from "~/lib/actions"
import { getBaseUrl } from "~/lib/utils"
import { registerInputSchema } from "./validation"
import { registerResponseSchema } from "~/app/api/users/validation"

export const registerAction = action(
    { input: registerInputSchema },
    async (data) => {
        const res = await fetch(`${getBaseUrl()}/api/users`, {
            method: "POST",
            body: JSON.stringify(data),
            next: {
                revalidate: 0,
            },
        })
        const json = await res.json()

        const parsed = registerResponseSchema.parse(json)

        return parsed
    },
)
