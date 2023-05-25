import Credentials from "next-auth/providers/credentials"
import { usersService } from "../users/users.service"
import { NextAuthOptions } from "next-auth"
import { DrizzleAdapter } from "~/db/auth-adapter"
import { db } from "~/db"

export const authOptions: NextAuthOptions = {
    // Choose how you want to save the user session.
    // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
    // If you use an `adapter` however, we default it to `"database"` instead.
    // You can still force a JWT session by explicitly defining `"jwt"`.
    // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token }) {
            if (!token.email) return token

            const user = await usersService.getUserByEmail(token.email)

            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.image = user.image
            }

            return token
        },
        async session({ session }) {
            if (!session.user?.email) return session

            const user = await usersService.getUserByEmail(session.user.email)

            if (user) {
                //@ts-ignore
                session.user.id = user.id
                session.user.name = user.name
                session.user.email = user.email
                session.user.image = user.image!
            }

            return session
        },
        redirect({ baseUrl }) {
            return baseUrl
        },
    },
    providers: [
        Credentials({
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) throw new Error("Missing credentials")

                // You need to provide your own logic here that takes the credentials
                // submitted and returns either a object representing a user or value
                // that is false/null if the credentials are invalid.
                // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                // You can also use the `req` object to obtain additional parameters
                // (i.e., the request IP address)
                const res = await usersService.verifyCredentials(
                    credentials.email,
                    credentials.password,
                )

                return res
            },
        }),
    ],
    adapter: DrizzleAdapter(db),
    pages: {
        signIn: "/login",
        newUser: "/register",
    },
}
