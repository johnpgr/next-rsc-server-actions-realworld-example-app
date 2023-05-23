'use client'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Button } from '~/components/ui/button'
import { publishArticleAction } from './actions'
import { getFormData } from '~/lib/utils'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

type EditorProps = {
    title?: string
    description?: string
    body?: string
    tags?: string[]
}

export const Editor = (props: EditorProps) => {
    const router = useRouter()
    const [error, setError] = useState<string>('')
    const [validationError, setValidationError] = useState<string>('')

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const input = getFormData<{
            title: string
            description: string
            body: string
            tags: string
        }>(e)

        const tags = input.tags.split(',')
        const { data, validationError } = await publishArticleAction({
            article: {
                title: input.title,
                description: input.description,
                body: input.body,
                tagList: tags,
            },
        })

        if (validationError) {
            setValidationError(
                validationError.article?.map((e) => e).join(',') || '',
            )
        }

        if (data?.error) {
            setError(data.error.message)
        }

        if (data?.article) {
            router.push(`/article/${data.article.slug}`)
        }
    }

    return (
        <div className="container mx-auto max-w-3xl">
            <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
                {error && (
                    <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {validationError && (
                    <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline">
                            {validationError}
                        </span>
                    </div>
                )}
                <Input
                    name="title"
                    placeholder="Article title"
                    defaultValue={props?.title}
                />
                <Input
                    name="description"
                    placeholder="What is this article about?"
                    defaultValue={props?.description}
                />
                <Textarea
                    name="body"
                    placeholder="Write your article (in markdown)"
                    defaultValue={props?.body}
                />
                <Input
                    onKeyDown={(e) => {
                        if (e.key === ' ') {
                            e.preventDefault()
                            console.log('space press')
                            e.currentTarget.value += ','
                        }
                    }}
                    name="tags"
                    placeholder="Enter tags"
                    defaultValue={props.tags && props.tags.join(' ')}
                />
                <Button className="ml-auto">
                    {props.body ? 'Update article' : 'Publish article'}
                </Button>
            </form>
        </div>
    )
}
