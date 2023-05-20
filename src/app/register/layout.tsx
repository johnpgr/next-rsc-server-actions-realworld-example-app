import { UnauthRequiredPage } from "~/components/unauthed-required-page"

export default function RegisterPageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    //@ts-expect-error Async Server Component
    return <UnauthRequiredPage>{children}</UnauthRequiredPage>
}
