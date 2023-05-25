import { cookies } from "next/headers"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ProfileActionButton } from "~/components/profile/profile-action-button"
import {
    DEFAULT_USER_IMAGE,
    HEADER_HEIGHT,
    USER_TOKEN,
} from "~/config/constants"
import { authService } from "~/modules/auth/auth.service"
import { usersService } from "~/modules/users/users.service"
import { ProfileTabs } from "~/components/profile/profile-tabs"

export const runtime = "edge"

export default async function ProfilePage({
    params,
    children,
}: {
    params: { username: string }
    children: React.ReactNode
}) {
    const token = cookies().get(USER_TOKEN)?.value

    const user = token ? await authService.getPayloadFromToken(token) : null

    const profile = await usersService.getUserProfile(params.username, user?.id)

    if (!profile) {
        return notFound()
    }

    return (
        <div style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}>
            <div className="flex h-[30%] w-full items-center justify-center bg-muted">
                <div className="flex w-1/2 flex-col items-center justify-center gap-4">
                    <Image
                        src={profile.image ?? DEFAULT_USER_IMAGE}
                        alt={profile.username}
                        width={100}
                        height={100}
                        className="rounded-full"
                    />
                    <h1 className="text-xl font-bold text-zinc-700">
                        {profile.username}
                    </h1>
                    <ProfileActionButton
                        user={{
                            id: profile.id,
                            name: profile.username,
                        }}
                        currentUsername={user?.username ?? null}
                        following={profile.following}
                    />
                </div>
            </div>
            <div className="container mx-auto mt-6 max-w-5xl">
                <ProfileTabs username={profile.username} />
                {children}
            </div>
        </div>
    )
}
