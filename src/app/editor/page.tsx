import { AuthRequiredPage } from '~/components/auth-required-page'
import { Editor } from './editor'

export const runtime = 'edge'

export default function EditorPage() {
    return (
        //@ts-expect-error Async server component
        <AuthRequiredPage>
            <Editor />
        </AuthRequiredPage>
    )
}
