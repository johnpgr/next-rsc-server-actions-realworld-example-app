import { AuthRequiredPage } from "~/components/auth/auth-required-page"
import { Editor } from "~/components/editor"

//runtime edge doesnt work here
export const runtime = "nodejs"

export default function EditorPage() {
    return (
        //@ts-expect-error Async server component
        <AuthRequiredPage>
            <Editor />
        </AuthRequiredPage>
    )
}
