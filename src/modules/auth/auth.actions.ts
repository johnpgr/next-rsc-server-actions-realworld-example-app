'use server'
import { action } from '~/utils/actions'
import { loginInputSchema, registerInputSchema } from './auth.validation'
import { authService } from './auth.service'
import { DEFAULT_USER_IMAGE, USER_TOKEN } from '~/config/constants'
import { usersService } from '../users/users.service'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'

export const loginAction = action({ input: loginInputSchema }, async (data) => {
    try {
        const { email, password } = data.user

        const user = await authService.verifyCredentials(email, password)

        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            bio: user.bio,
            image: user.image,
        }

        const token = await authService.createToken(safeUser)
        const userToken = await authService.getPayloadFromToken(token)

        if (!userToken) throw new Error('Failed to login')

        revalidateTag('user_article_list')

        cookies().set(USER_TOKEN, token)

        return { user: userToken }
    } catch (error) {
        return {
            error: {
                message: (error as Error).message,
                code: 400,
            },
        }
    }
})

export const registerAction = action(
    { input: registerInputSchema },
    async (data) => {
        try {
            const { email, password, username } = data.user

            const user = await usersService.createUser({
                email,
                password,
                username,
                image: DEFAULT_USER_IMAGE,
            })

            const safeUser = {
                id: user.id,
                email: user.email,
                username: user.username,
                bio: user.bio,
                image: user.image,
            }

            const token = await authService.createToken(safeUser)
            const userToken = await authService.getPayloadFromToken(token)

            revalidateTag('user_article_list')

            cookies().set(USER_TOKEN, token)

            return { user: userToken }
        } catch (error) {
            return {
                error: { code: 400, message: (error as Error).message },
            }
        }
    },
)
