export type Comment = {
    id: string
    body: string
    updatedAt: string
    createdAt: string
    author: {
        username: string
        bio: string | null
        image: string | null
        following: boolean
    }
}