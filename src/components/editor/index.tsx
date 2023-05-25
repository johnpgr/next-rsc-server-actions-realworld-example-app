"use client"
import { Textarea } from "~/components/ui/textarea"
import { Input } from "../ui/input"
import { Button } from "~/components/ui/button"
import {
    editArticleAction,
    publishArticleAction,
} from "~/modules/articles/articles.actions"
import { getFormData } from "~/utils/forms"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Spinner } from "~/components/spinner"

type EditorProps = {
    slug?: string
    article?: {
        title?: string
        description?: string
        body?: string
        tags?: string[]
    } | null
}

export const Editor = (props: EditorProps) => {
    const router = useRouter()
    const [error, setError] = useState<string>("")
    const [validationError, setValidationError] = useState<string[]>([])
    const [isPending, setIsPending] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const input = getFormData<{
            title: string
            description: string
            body: string
            tags: string
        }>(e)

        const tags = input.tags !== "" ? input.tags.split(",") : []

        const { data, validationError } = props.slug
            ? await editArticleAction({
                  slug: props.slug,
                  article: {
                      title: input.title,
                      description: input.description,
                      body: input.body,
                      tagList: tags,
                  },
              })
            : await publishArticleAction({
                  article: {
                      title: input.title,
                      description: input.description,
                      body: input.body,
                      tagList: tags,
                  },
              })

        if (validationError) {
            setValidationError(validationError.article || [])
        }

        if (data?.error) {
            setError(data.error.message)
        }

        if (data?.article) {
            router.push(`/article/${data.article.slug}`)
        }

        setIsPending(false)
    }

    return (
        <div className="container mx-auto max-w-3xl">
            <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
                {error && (
                    <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700">
                        <p>{error}</p>
                    </div>
                )}
                {validationError && validationError.length > 0 && (
                    <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700">
                        {validationError.map((e, i) => (
                            <p key={`error_${i}`}>{e}</p>
                        ))}
                    </div>
                )}
                <Input
                    name="title"
                    required
                    placeholder="Article title"
                    defaultValue={props.article?.title}
                />
                <Input
                    name="description"
                    required
                    placeholder="What is this article about?"
                    defaultValue={props.article?.description}
                />
                <Textarea
                    name="body"
                    required
                    placeholder="Write your article (in markdown)"
                    defaultValue={props.article?.body}
                />
                <Input
                    onKeyDown={(e) => {
                        if (e.key === " ") {
                            e.preventDefault()
                            console.log("space press")
                            e.currentTarget.value += ","
                        }
                    }}
                    name="tags"
                    placeholder="Enter tags"
                    defaultValue={
                        props.article?.tags && props.article?.tags.join(" ")
                    }
                />
                <Button className="ml-auto gap-1" disabled={isPending}>
                    {isPending ? <Spinner size={16} /> : null}
                    {props.slug ? "Update article" : "Publish article"}
                </Button>
            </form>
        </div>
    )
}
