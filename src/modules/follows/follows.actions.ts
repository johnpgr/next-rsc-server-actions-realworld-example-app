"use server"
import { action } from "~/utils/actions"
import { followUserSchema } from "./follows.validation"
import { followsService } from "./follows.service"
import { revalidatePath, revalidateTag } from "next/cache"
import { usersService } from "../users/users.service"

export const followUserAction = action(
    {
        input: followUserSchema,
        withAuth: true,
    },
    async (data, { session }) => {
        try {
            if (!session || !session.user) throw new Error("You must be logged in to follow a user")

            const [followingUser] = await Promise.all([
                await usersService.getUser(data.followingId),
                await followsService.followUser(session.user.id, data.followingId),
            ])

            revalidatePath(`/profile/${followingUser?.name}`)
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
    async (data, { session }) => {
        try {
            if (!session || !session.user)
                throw new Error("You must be logged in to unfollow a user")

            const [followingUser] = await Promise.all([
                await usersService.getUser(data.followingId),
                await followsService.unfollowUser(session.user.id, data.followingId),
            ])

            revalidatePath(`/profile/${followingUser?.name}`)
        } catch (error) {
            return {
                error: { message: (error as Error).message, code: 400 },
            }
        }
    },
)
