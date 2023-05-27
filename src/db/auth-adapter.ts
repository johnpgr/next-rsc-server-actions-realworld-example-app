// Most of the code is taken from: https://github.com/nextauthjs/next-auth/pull/7165
import { and, eq } from "drizzle-orm"
import type { Adapter, VerificationToken } from "next-auth/adapters"
import { db } from "."
import * as schema from "./schema"
import { createId } from "~/utils/id"

export function DrizzleAdapter(database: typeof db): Adapter {
    return {
        createUser: (data) => {
            return database
                .insert(schema.user)
                .values({
                    ...data,
                    name: data.name ?? "Unknown user",
                    password: createId(),
                    id: createId(),
                })
                .returning()
                .get()
        },
        getUser: (id) => {
            return (
                database
                    .select()
                    .from(schema.user)
                    .where(eq(schema.user.id, id))
                    .get() ?? null
            )
        },
        getUserByEmail: (email) => {
            return (
                database
                    .select()
                    .from(schema.user)
                    .where(eq(schema.user.email, email))
                    .get() ?? null
            )
        },
        createSession: (session) => {
            return database
                .insert(schema.session)
                .values(session)
                .returning()
                .get()
        },
        getSessionAndUser: (sessionToken) => {
            return (
                database
                    .select({
                        session: schema.session,
                        user: schema.user,
                    })
                    .from(schema.session)
                    .where(eq(schema.session.sessionToken, sessionToken))
                    .innerJoin(
                        schema.user,
                        eq(schema.user.id, schema.session.userId),
                    )
                    .get() ?? null
            )
        },
        updateUser: (user) => {
            return database
                .update(schema.user)
                .set({
                    email: user.email,
                    emailVerified: user.emailVerified,
                    image: user.image,
                    name: user.name ?? undefined,
                })
                .where(eq(schema.user.id, user.id))
                .returning()
                .get()
        },
        updateSession: (session) => {
            return database
                .update(schema.session)
                .set(session)
                .where(eq(schema.session.sessionToken, session.sessionToken))
                .returning()
                .get()
        },
        linkAccount: async (rawAccount) => {
            const updatedAccount = await database
                .insert(schema.account)
                .values(rawAccount)
                .returning()
                .get()

            const account: ReturnType<Adapter["linkAccount"]> = {
                ...updatedAccount,
                access_token: updatedAccount.access_token ?? undefined,
                token_type: updatedAccount.token_type ?? undefined,
                id_token: updatedAccount.id_token ?? undefined,
                refresh_token: updatedAccount.refresh_token ?? undefined,
                scope: updatedAccount.scope ?? undefined,
                expires_at: updatedAccount.expires_at ?? undefined,
                session_state: updatedAccount.session_state ?? undefined,
            }

            return account
        },
        getUserByAccount: (account) => {
            return (
                database
                    .select({
                        id: schema.user.id,
                        email: schema.user.email,
                        emailVerified: schema.user.emailVerified,
                        image: schema.user.image,
                        name: schema.user.name,
                    })
                    .from(schema.user)
                    .innerJoin(
                        schema.account,
                        and(
                            eq(
                                schema.account.providerAccountId,
                                account.providerAccountId,
                            ),
                            eq(schema.account.provider, account.provider),
                        ),
                    )
                    .get() ?? null
            )
        },
        deleteSession: (sessionToken) => {
            return (
                database
                    .delete(schema.session)
                    .where(eq(schema.session.sessionToken, sessionToken))
                    .returning()
                    .get() ?? null
            )
        },
        createVerificationToken: (verificationToken) => {
            return database
                .insert(schema.verificationToken)
                .values(verificationToken)
                .returning()
                .get()
        },
        useVerificationToken: async (verificationToken) => {
            try {
                return (database
                    .delete(schema.verificationToken)
                    .where(
                        and(
                            eq(
                                schema.verificationToken.identifier,
                                verificationToken.identifier,
                            ),
                            eq(
                                schema.verificationToken.token,
                                verificationToken.token,
                            ),
                        ),
                    )
                    .returning()
                    .get() ?? null) as Promise<VerificationToken | null>
            } catch {
                throw new Error("No verification token found.")
            }
        },
        deleteUser: (id) => {
            return database
                .delete(schema.user)
                .where(eq(schema.user.id, id))
                .returning()
                .get()
        },
        unlinkAccount: (account) => {
            database
                .delete(schema.account)
                .where(
                    and(
                        eq(
                            schema.account.providerAccountId,
                            account.providerAccountId,
                        ),
                        eq(schema.account.provider, account.provider),
                    ),
                )
                .run()

            return undefined
        },
    }
}
