'use server'
import { action } from '~/utils/actions'
import { followUserSchema } from './follows.validation'
import { followsService } from './follows.service'
import { revalidatePath } from 'next/cache'
import { usersService } from '../users/users.service'

export const followUserAction = action(
    {
        input: followUserSchema,
        withAuth: true,
    },
    async (data, { user }) => {
        try {
            if (!user) throw new Error('You must be logged in to follow a user')

            await followsService.followUser(user.id, data.followingId)

            const followingUser = await usersService.getUser(data.followingId)

            revalidatePath(`/profile/${followingUser?.username}`)
            revalidatePath('/')
        } catch (error) {
            return {
                error: { message: (error as Error).message, code: 400 },
            }
        }
    },
)

export const unfollowUserAction = action(
    {
        input: followUserSchema,
        withAuth: true,
    },
    async (data, { user }) => {
        try {
            if (!user)
                throw new Error('You must be logged in to unfollow a user')

            await followsService.unfollowUser(user.id, data.followingId)

            const followingUser = await usersService.getUser(data.followingId)

            revalidatePath(`/profile/${followingUser?.username}`)
            revalidatePath('/')
        } catch (error) {
            return {
                error: { message: (error as Error).message, code: 400 },
            }
        }
    },
)
