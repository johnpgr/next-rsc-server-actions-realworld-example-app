'use server'
import { action } from '~/lib/utils'
import { registerInputSchema } from './validation'
import { authService } from '~/services/auth'
import { SafeUser } from '~/types/user'
import { DEFAULT_USER_IMAGE } from '~/lib/constants'

export const registerAction = action(
    { input: registerInputSchema },
    async (data) => {
        try {
            const { email, password, username } = data.user

            const user = await authService.registerUser({
                email,
                password,
                username,
                image: DEFAULT_USER_IMAGE,
            })

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
