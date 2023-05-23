'use server'
import { getBaseUrl, action } from '~/lib/utils'
import { registerInputSchema } from './validation'
import { registerResponseSchema } from '~/app/api/users/(register)/validation'
import { authService } from '~/services/auth'
import { SafeUser } from '~/types/user'

export const registerAction = action(
    { input: registerInputSchema },
    async (data) => {
        try {
            const { email, password, username } = data.user

            const user = await authService.registerUser(
                email,
                password,
                username,
            )

            const safeUser = {
                email: user.email,
                username: user.username,
                bio: user.bio,
                image: user.image,
            }

            const token = await authService.createToken(safeUser)

            //@ts-ignore
            safeUser.token = token

            return {
                user: safeUser as SafeUser & { token: string },
            }
        } catch (error) {
            return {
                error: { code: 400, message: (error as Error).message },
            }
        }
    },
)
