import { InferModel } from "drizzle-orm"
import { comment } from "~/db/schema"

export type Comment = {
    id: string
    body: string
    updatedAt: string
    createdAt: string
    author: {
        name: string
        bio: string | null
        image: string | null
        following: boolean
    }
}

export type CommentModel = InferModel<typeof comment>
