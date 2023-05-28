import Image from "next/image"
import { notFound } from "next/navigation"
import { ProfileActionButton } from "~/components/profile/profile-action-button"
import { DEFAULT_USER_IMAGE, HEADER_HEIGHT } from "~/config/constants"
import { usersService } from "~/modules/users/users.service"
import { ProfileTabs } from "~/components/profile/profile-tabs"
import { authOptions } from "~/modules/auth/auth.options"
import { getServerSession } from "next-auth"

export default async function ProfilePage({
    params,
    children,
}: {
    params: { username: string }
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    const profile = await usersService.getUserProfile(
        params.username,
        session?.user?.id,
    )

    if (!profile) {
        return notFound()
    }

    return (
        <div style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}>
            <div className="flex h-[30%] w-full items-center justify-center bg-muted">
                <div className="flex w-1/2 flex-col items-center justify-center gap-4">
                    <Image
                        src={profile.image ?? DEFAULT_USER_IMAGE}
                        alt={profile.name}
                        width={100}
                        height={100}
                        className="rounded-full"
                    />
                    <h1 className="text-xl font-bold text-zinc-700">
                        {profile.name}
                    </h1>
                    <ProfileActionButton
                        user={{
                            following: profile.following,
                            bio: profile.bio,
                            image: profile.image,
                            id: profile.id,
                            name: profile.name,
                        }}
                    />
                </div>
            </div>
            <div className="container mx-auto mt-6 max-w-5xl">
                <ProfileTabs username={profile.name ?? "Unknown user"} />
                {children}
            </div>
        </div>
    )
}
