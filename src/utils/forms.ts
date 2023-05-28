import { FormEvent } from "react"

export function getFormData<T extends object>(
    e: FormEvent<HTMLFormElement>,
): T {
    const formData = new FormData(e.currentTarget)

    const input = Object.fromEntries(formData.entries()) as unknown as T

    return input
}

export function errorBody(errors: string[]) {
    return {
        errors: {
            body: errors,
        },
    }
}

export function defaultErrorMessage(e: unknown) {
    if (e instanceof Error) {
        return e.message
    }

    throw new Error("UNKNOWN ERROR")
}
