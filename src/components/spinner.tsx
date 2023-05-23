import { Loader2 } from "lucide-react"

export const Spinner = (props: { size?: number }) => {
return <Loader2 size={props.size} className="text-primary-foreground animate-spin"/>
}
