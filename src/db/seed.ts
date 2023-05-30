import { InferModel } from "drizzle-orm"
import { createId } from "../utils/id"
import { db } from "."
import { faker } from "@faker-js/faker"
import * as schema from "./schema"

async function seedArticles(n: number) {
    const userId = createId()

    const user: InferModel<typeof schema.user, "insert"> = {
        id: userId,
        name: faker.internet.userName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraph(),
        image: faker.image.avatar(),
        password: faker.string.uuid(),
    }

    await db.insert(schema.user).values(user).run()

    for (let i = 0; i < n; i++) {
        const articleId = createId()
        await db
            .insert(schema.article)
            .values({
                id: articleId,
                title: faker.lorem.sentence(),
                description: faker.lorem.sentence(),
                body: faker.lorem.paragraphs(),
                slug: faker.lorem.slug(),
                author_id: user.id,
            })
            .run()

        const tagList = faker.lorem.words(3).split(" ")

        for (const tagItem of tagList) {
            const tagId = createId()
            await db
                .insert(schema.tag)
                .values({
                    id: tagId,
                    name: tagItem,
                    article_id: articleId,
                })
                .run()
        }
    }
}

console.log("Seeding fake data...")
seedArticles(10)
    .then(() => {
        console.log("done")
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
