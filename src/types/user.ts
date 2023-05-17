import { User } from "~/db/schema"

export type SafeUser = Omit<
    User,
    "id" | "password_id" | "created_at" | "updated_at"
> & { token: string }
