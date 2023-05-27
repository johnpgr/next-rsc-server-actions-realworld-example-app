/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/config/env.mjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true,
    },
    images: {
        domains: [
            "api.realworld.io",
            "cloudflare-ipfs.com",
            "avatars.githubusercontent.com",
        ],
    },
}

export default nextConfig
