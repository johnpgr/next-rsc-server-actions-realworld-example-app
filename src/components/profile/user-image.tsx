import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export const UserImage = (props: { image?: string; name: string, className?: string }) => {
    const { name, image } = props
    return (
        <Avatar className={props.className}>
            <AvatarImage src={image} />
            <AvatarFallback>
                {name[0].toUpperCase()}
                {name[1].toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}
