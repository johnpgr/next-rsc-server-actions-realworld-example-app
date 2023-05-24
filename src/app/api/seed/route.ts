import { db } from '~/db'
import { schema } from '~/db/schema'
import { faker } from '@faker-js/faker'
import { createId } from '~/utils/ulid'
import { jsonResponse } from '~/utils/api'
import { env } from '~/config/env.mjs'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

async function seedArticles(n: number) {
    if (env.NODE_ENV !== 'development') {
        redirect('/')
    }

    const userId = createId()

    const user = {
        id: userId,
        username: faker.internet.userName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraph(),
        image: faker.image.avatar(),
        password_id: faker.string.uuid(),
    }

    await db.insert(schema.user).values(user)

    for (let i = 0; i < n; i++) {
        const articleId = createId()
        await db.insert(schema.article).values({
            id: articleId,
            title: faker.lorem.sentence(),
            description: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(),
            slug: faker.lorem.slug(),
            author_id: user.id,
        })

        const tagList = faker.lorem.words(3).split(' ')

        for (const tagItem of tagList) {
            const tagId = createId()
            await db.insert(schema.tag).values({
                id: tagId,
                name: tagItem,
                article_id: articleId,
            })
        }
    }
}

export async function GET() {
    try {
        await seedArticles(10)
        return jsonResponse(200, {
            success: true,
        })
    } catch (error) {
        return jsonResponse(500, {
            errors: { body: [(error as Error).message] },
        })
    }
}
