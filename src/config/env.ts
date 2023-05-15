import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
    /*
     * Specify what prefix the client-side variables must have.
     * This is enforced both on type-level and at runtime.
     */
    clientPrefix: "NEXT_PUBLIC_",
    server: {
        DB_URL: z.string().url(),
        DB_HOST: z.string(),
        DB_USERNAME: z.string(),
        DB_PASSWORD: z.string(),
        JWT_SECRET: z.string(),
    },
    client: {},
    /**
     * What object holds the environment variables at runtime.
     * Often `process.env` or `import.meta.env`
     */
    runtimeEnv: process.env,
})
