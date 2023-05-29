import Link from "next/link"
import { Button } from "~/components/ui/button"
import { HEADER_HEIGHT } from "~/config/constants"

export default function NotFoundPage() {
    return (
        <div
            className="flex flex-col gap-2 w-full items-center justify-center"
            style={{
                height: `calc(100vh - ${HEADER_HEIGHT})`,
            }}
        >
            <h1 className="text-4xl font-semibold">Page not found.</h1>
            <h2 className="text-lg">Sorry, the page you are looking for does not exist.</h2>
            <Button asChild variant={"link"} className="p-0 w-fit h-fit">
                <Link href="/">
                    Go back home
                </Link>
            </Button>
        </div>
    )
}
