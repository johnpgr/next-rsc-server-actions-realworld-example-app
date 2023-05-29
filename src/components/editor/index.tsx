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
import { useSession } from "next-auth/react"

type EditorProps = {
    slug?: string
    article?: {
        title?: string
        description?: string
        body?: string
        tagList?: string[]
    } | null
}

export const Editor = (props: EditorProps) => {
    const router = useRouter()
    const [error, setError] = useState<string>("")
    const [validationError, setValidationError] = useState<string[]>([])
    const [isPending, setIsPending] = useState(false)
    const { data: session } = useSession()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)
        setError("")
        setValidationError([])

        const input = getFormData<{
            title: string
            description: string
            body: string
            tags: string
        }>(e)

        const { data, validationError } = props.slug
            ? await editArticleAction({
                  session,
                  slug: props.slug,
                  article: {
                      title: input.title,
                      description: input.description,
                      body: input.body,
                      tagList: input.tags,
                  },
              })
            : await publishArticleAction({
                  session,
                  article: {
                      title: input.title,
                      description: input.description,
                      body: input.body,
                      tagList: input.tags,
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
        <div className="mx-auto w-full max-w-3xl mt-8">
            <h1 className="text-center text-[40px] mb-4">
                {props.slug ? "Edit article" : "New article"}
            </h1>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
                    name="tags"
                    //add a comma when space is pressed
                    onKeyDown={(e) => {
                        if (e.key === " ") {
                            e.preventDefault()
                            e.currentTarget.value += ","
                        }
                    }}
                    //remove the last comma if theres no text after it
                    onBlur={(e) =>
                        e.currentTarget.value.endsWith(",") &&
                        e.currentTarget.value.length > 1
                            ? (e.currentTarget.value =
                                  e.currentTarget.value.slice(0, -1))
                            : null
                    }
                    placeholder="Enter tags"
                    defaultValue={
                        props.article?.tagList &&
                        props.article?.tagList.join(",")
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
