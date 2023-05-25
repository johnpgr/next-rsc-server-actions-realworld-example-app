import { getServerSession } from "next-auth"
import { ArticleRow } from "~/components/articles/article-row"
import { articlesService } from "~/modules/articles/articles.service"
import { authOptions } from "~/modules/auth/auth.options"

export default async function UserArticlesPage({
    params,
}: {
    params: { username: string }
}) {
    const session = await getServerSession(authOptions)

    const articles = await articlesService.getArticles({
        currentUserId: session?.user?.id ?? null,
        feedType: "global",
        params: {
            authorName: params.username,
            favoritedBy: null,
            tag: null,
            limit: 10,
            offset: 0,
        },
    })

    return (
        <ul className="divide-y">
            {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
            ))}
        </ul>
    )
}
