import { UnauthRequiredPage } from '~/components/auth/unauthed-required-page'

export const runtime = 'edge'

export default function RegisterPageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    //@ts-expect-error Async Server Component
    return <UnauthRequiredPage>{children}</UnauthRequiredPage>
}
