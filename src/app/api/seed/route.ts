import { db } from "~/db/drizzle-db"
import { article, tag, user as userTable } from "~/db/schema"
import { faker } from "@faker-js/faker"
import { jsonResponse } from "~/lib/utils"

async function seedArticles(n: number) {
    const user = {
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraph(),
        image: faker.image.avatar(),
        password_id: faker.string.uuid(),
    }

    await db.insert(userTable).values(user)

    for (let i = 0; i < n; i++) {
        const articleId = faker.string.uuid()
        await db.insert(article).values({
            id: articleId,
            title: faker.lorem.sentence(),
            description: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(),
            slug: faker.lorem.slug(),
            author_id: user.id,
        })

        const tagList = faker.lorem.words(3).split(" ")

        for (const tagItem of tagList) {
            await db.insert(tag).values({
                id: faker.string.uuid(),
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
            success: false,
        })
    }
}
