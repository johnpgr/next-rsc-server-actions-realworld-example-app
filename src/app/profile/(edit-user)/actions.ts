'use server'
import { getBaseUrl, action } from '~/lib/utils'
import { editUserInputSchema } from './validation'
import {
    getCurrentUserResponseSchema,
    CurrentUserResponse,
} from '~/app/api/user/(get,put)/validation'

export const editUserAction = action(
    { input: editUserInputSchema },
    async (data) => {
        const res = await fetch(`${getBaseUrl()}/api/user`, {
            method: 'PUT',
            body: JSON.stringify(data),
            next: {
                revalidate: 0,
            },
        })

        const json = (await res.json()) as CurrentUserResponse

        const parsed = getCurrentUserResponseSchema.parse(json)

        return parsed
    },
)
