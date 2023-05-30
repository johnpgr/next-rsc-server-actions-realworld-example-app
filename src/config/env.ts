import dotenv from "dotenv"
import { z } from "zod"
import { createEnv } from "@t3-oss/env-nextjs"

dotenv.config()

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DB_URL: z.string(),
        DB_TOKEN: z.string(),
        DB_LOGGER: z.string().transform((val) => val === "true"),
        NEXTAUTH_SECRET: z.string(),
        NEXTAUTH_URL: z.string(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
        DB_TOKEN: process.env.DB_TOKEN,
        DB_LOGGER: process.env.DB_LOGGER,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
})

