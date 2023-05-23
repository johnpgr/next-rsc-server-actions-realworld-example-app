'use server'
import { action } from '~/lib/utils'
import { loginInputSchema } from './validation'
import { authService } from '~/services/auth'
import { SafeUser } from '~/types/user'

export const loginAction = action({ input: loginInputSchema }, async (data) => {
    try {
        const { email, password } = data.user

        const user = await authService.verifyCredentials(email, password)

        const safeUser = {
            email: user.email,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        const token = await authService.createToken(safeUser)

        //@ts-ignore
        safeUser.token = token

        return { user: safeUser as SafeUser & { token: string } }
    } catch (error) {
        return {
            error: {
                message: (error as Error).message,
                code: 400,
            },
        }
    }
})
