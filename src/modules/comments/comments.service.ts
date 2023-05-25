import * as schema from "~/db/schema"
import { CreateComment } from "./comments.validation"
import { db } from "~/db/"
import { and, desc, eq, sql } from "drizzle-orm"
import { Comment, CommentModel } from "./comments.types"

class CommentService {
    private database:typeof db 

    constructor(database: typeof db) {
        this.database = database
    }

    async getCommentsFromArticleId(
        articleId: string,
        currentUserId: string | null,
    ): Promise<Comment[]> {
        const comments = await this.database
            .select({
                id: schema.comment.id,
                body: schema.comment.body,
                updatedAt: schema.comment.updated_at,
                author: {
                    username: schema.user.name,
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
            if (!comment.author) {
                continue
            }
            comment.author.following = comment.author?.following === "1"
        }

        return comments as unknown as Comment[]
    }

    async createComment(args: {
        comment: CreateComment
        articleId: string
        authorId: string
    }): Promise<CommentModel> {
        const { articleId, authorId } = args
        const { body } = args.comment

        const [comment] = await this.database.insert(schema.comment).values({
            body,
            article_id: articleId,
            author_id: authorId,
        }).returning()

        return comment
    }

    async deleteComment(args: {
        commentId: string
        userId: string
    }): Promise<CommentModel> {
        const { commentId, userId } = args

        const [comment] = await this.database
            .delete(schema.comment)
            .where(
                and(
                    eq(schema.comment.id, commentId),
                    eq(schema.comment.author_id, userId),
                ),
            )
        .returning()

        return comment
    }

    async isCommentAuthor(args: {
        commentId: string
        userId: string
    }): Promise<boolean> {
        const { commentId, userId } = args

        const [{ authorId }] = await this.database
            .select({ authorId: schema.comment.author_id })
            .from(schema.comment)
            .where(eq(schema.comment.id, commentId))
            .limit(1)

        return authorId === userId
    }
}

export const commentsService = new CommentService(db)
