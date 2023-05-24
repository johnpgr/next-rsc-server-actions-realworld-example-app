export type PageSearchParams = { [key: string]: string | string[] | undefined }

export function getSearchParam(
    searchParams: PageSearchParams,
    key: string,
): string | null {
    const value = searchParams[key]
    if (Array.isArray(value)) {
        return value[0]
    }

    return value ?? null
}

export function getSearchParams(
    searchParams: PageSearchParams,
    keys: string[],
): { [key: string]: string | null } {
    const params: { [key: string]: string | null } = {}

    for (const key of keys) {
        const value = searchParams[key]

        if (Array.isArray(value)) {
            params[key] = value[0]
            continue
        }

        params[key] = value ?? null
    }

    return params
}
