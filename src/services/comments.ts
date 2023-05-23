import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import { comment as commentTable, user, follow } from '~/db/schema'
import { CreateCommentBody } from '~/app/api/articles/[slug]/comments/validation'
import { createId, getDateFromULID } from '~/lib/utils'
import { db } from '~/db/drizzle-db'
import { and, desc, eq, sql } from 'drizzle-orm'

type Comment = {
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

class CommentService {
    private db: PlanetScaleDatabase

    constructor(db: PlanetScaleDatabase) {
        this.db = db
    }

    async getCommentsFromArticleId(
        articleId: string,
        currentUserId: string | null,
    ): Promise<Comment[]> {
        const comments = await this.db
            .select({
                id: commentTable.id,
                body: commentTable.body,
                updatedAt: commentTable.updated_at,
                author: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: sql`IF(${follow.id} IS NULL, FALSE, TRUE)`,
                },
            })
            .from(commentTable)
            .leftJoin(user, eq(user.id, commentTable.author_id))
            .leftJoin(
                follow,
                and(
                    eq(follow.follower_id, sql`${currentUserId}`),
                    eq(follow.following_id, commentTable.author_id),
                ),
            )
            .where(eq(commentTable.article_id, articleId))
            .orderBy(desc(commentTable.id))

        for (const comment of comments) {
            //@ts-ignore
            comment.createdAt = getDateFromULID(comment.id)

            if (!comment.author) {
                continue
            }
            comment.author.following = comment.author?.following === '1'
        }

        return comments as unknown as Comment[]
    }

    async createComment(args: {
        input: CreateCommentBody
        articleId: string
        authorId: string
    }): Promise<void> {
        const { articleId, authorId } = args
        const { comment } = args.input

        const { rowsAffected } = await this.db.insert(commentTable).values({
            body: comment.body,
            id: createId(),
            article_id: articleId,
            author_id: authorId,
        })

        if (rowsAffected !== 1) {
            throw new Error('Failed to create comment')
        }
    }

    async deleteComment(args: {
        commentId: string
        userId: string
    }): Promise<void> {
        const { commentId, userId } = args

        const { rowsAffected } = await this.db
            .delete(commentTable)
            .where(
                and(
                    eq(commentTable.id, commentId),
                    eq(commentTable.author_id, userId),
                ),
            )

        if (rowsAffected !== 1) {
            throw new Error('Failed to delete comment')
        }
    }

    async isCommentAuthor(args: {
        commentId: string
        userId: string
    }): Promise<boolean> {
        const { commentId, userId } = args

        const [{ authorId }] = await this.db
            .select({ authorId: commentTable.author_id })
            .from(commentTable)
            .where(eq(commentTable.id, commentId))
            .limit(1)

        return authorId === userId
    }
}

export const commentsService = new CommentService(db)
