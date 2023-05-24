'use client'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { Plus, Settings } from 'lucide-react'

type ProfileActionButtonProps = {
    username: string
    currentUsername: string | null
}
export const ProfileActionButton = ({
    username,
    currentUsername,
}: ProfileActionButtonProps) => {
    return (
        <div className='ml-auto'>
            {currentUsername === username ? (
                <Button size={'sm'} variant="outline" asChild>
                    <Link href="/settings" className="flex items-center gap-1">
                        <Settings size={16} /> Edit Profile Settings
                    </Link>
                </Button>
            ) : (
                <Button size={'sm'} variant="outline" className="flex items-center gap-1">
                    <Plus size={16} /> Follow {username}
                </Button>
            )}
        </div>
    )
}
