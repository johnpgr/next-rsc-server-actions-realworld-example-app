import { articlePages } from "~/config/constants"

/** This function is used to determine if the current path is an article list page.
 * Example: "/", "/global", "/tag/:tagName"
 */
export function isArticlesPage(str: string) {
    for (let i = 0; i < articlePages.length; i++) {
        const pattern = articlePages[i]
        const regex = new RegExp(
            "^" + pattern.replace(/:[a-zA-Z_]+/g, "[a-zA-Z_]+") + "$",
        )

        if (regex.test(str)) {
            return true
        }
    }

    return false
}
