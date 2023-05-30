"use server"

import { action } from "~/utils/actions"
import { updateUserSchema } from "./users.validation"
import { usersService } from "./users.service"

export const updateUserAction = action(
    {
        input: updateUserSchema,
        withAuth: true,
    },
    async (data, { session }) => {
        try {
            if (!session.user)
                throw new Error("You must be logged in to update a user")

            const res = await usersService.updateUser(
                session.user.id,
                data.user,
            )

            return {
                user: res,
            }
        } catch (err) {
            return {
                error: {
                    message: (err as Error).message,
                    status: 403,
                },
            }
        }
    },
)
