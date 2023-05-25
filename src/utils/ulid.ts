import { decodeTime, ulidFactory } from "ulid-workers"

export function createId(): string {
    const ulid = ulidFactory({ monotonic: true })
    return ulid()
}

export function getDateFromULID(ulid: string) {
    return new Date(decodeTime(ulid))
}
