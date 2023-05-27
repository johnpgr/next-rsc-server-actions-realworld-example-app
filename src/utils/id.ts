import { monotonicFactory } from "ulid"

export function createId(): string {
    const ulid = monotonicFactory()
    return ulid()
}


