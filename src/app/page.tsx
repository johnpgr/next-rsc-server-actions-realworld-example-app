import { UserButton } from "~/components/user-button"

export const runtime = "edge"

export default function Home() {
    return (
        <h1>
            Hello world
            <UserButton />
        </h1>
    )
}
