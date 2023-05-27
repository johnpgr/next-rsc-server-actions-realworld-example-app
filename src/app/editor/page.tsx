import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Editor } from "~/components/editor"
import { authOptions } from "~/modules/auth/auth.options"

export default async function EditorPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")
    return <Editor />
}
