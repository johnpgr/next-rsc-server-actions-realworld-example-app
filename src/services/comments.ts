import { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import * as schema from '~/db/schema'
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
    private db: PlanetScaleDatabase<typeof schema>

    constructor(db: PlanetScaleDatabase<typeof schema>) {
        this.db = db
    }

    async getCommentsFromArticleId(
        articleId: string,
        currentUserId: string | null,
    ): Promise<Comment[]> {
        const comments = await this.db
            .select({
                id: schema.comment.id,
                body: schema.comment.body,
                updatedAt: schema.comment.updated_at,
                author: {
                    username: schema.user.username,
                    bio: schema.user.bio,
                    image: schema.user.image,
                    following: sql`IF(${schema.follow.id} IS NULL, FALSE, TRUE)`,
                },
            })
            .from(schema.comment)
            .leftJoin(schema.user, eq(schema.user.id, schema.comment.author_id))
            .leftJoin(
                schema.follow,
                and(
                    eq(schema.follow.follower_id, sql`${currentUserId}`),
                    eq(schema.follow.following_id, schema.comment.author_id),
                ),
            )
            .where(eq(schema.comment.article_id, articleId))
            .orderBy(desc(schema.comment.id))

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

        const { rowsAffected } = await this.db.insert(schema.comment).values({
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
            .delete(schema.comment)
            .where(
                and(
                    eq(schema.comment.id, commentId),
                    eq(schema.comment.author_id, userId),
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
            .select({ authorId: schema.comment.author_id })
            .from(schema.comment)
            .where(eq(schema.comment.id, commentId))
            .limit(1)

        return authorId === userId
    }
}

export const commentsService = new CommentService(db)
