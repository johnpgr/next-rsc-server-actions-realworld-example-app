import { Adapter, AdapterAccount, VerificationToken } from "next-auth/adapters"
import { and, eq } from "drizzle-orm"
import * as schema from "./schema"
import { db } from "."
import { randomUUID } from "crypto"
import { hash } from "bcryptjs"

export function DrizzleAdapter(database: typeof db): Adapter {
    return {
        //This method should not be used to create user
        createUser: async (data) => {
            const user = await database
                .insert(schema.user)
                .values({
                    ...data,
                    password: await hash(randomUUID(),12),

                })
                .returning()

            return user[0]
        },
        getUser: async (id) => {
            const user = await database.query.user.findFirst({
                where: eq(schema.user.id, id),
            })

            return user ?? null
        },
        getUserByEmail: async (email) => {
            const user = await database.query.user.findFirst({
                where: eq(schema.user.email, email),
            })

            return user ?? null
        },
        createSession: async (data) => {
            const [session] = await database
                .insert(schema.session)
                .values(data)
                .returning()
            return session
        },
        getSessionAndUser: async (sessionToken) => {
            const sessionAndUser2 = await database
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
            return sessionAndUser2[0] ?? null
        },
        updateUser: async (user) => {
            const updated = await database
                .update(schema.user)
                .set(user)
                .where(eq(schema.user.id, user.id))
                .returning()
            return updated[0]
        },
        updateSession: async (session) => {
            const updated = await database
                .update(schema.session)
                .set(session)
                .where(eq(schema.session.sessionToken, session.sessionToken))
                .returning()
            return updated[0]
        },
        linkAccount: async (rawAccount) => {
            const [updatedAccount] = await database
                .insert(schema.account)
                .values(rawAccount)
                .returning()

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
        getUserByAccount: async (account) => {
            const user = await database
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
                .limit(1)
            return user[0]
        },
        deleteSession: async (sessionToken) => {
            const session = await database
                .delete(schema.session)
                .where(eq(schema.session.sessionToken, sessionToken))
                .returning()
            return session[0]
        },
        createVerificationToken: async (verificationToken) => {
            const vt = await database
                .insert(schema.verificationToken)
                .values(verificationToken)
                .returning()
            return vt[0]
        },
        useVerificationToken: async (verificationToken) => {
            try {
                const vt = await database
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
                return vt[0]
            } catch {
                throw new Error("No verification token found.")
            }
        },
        deleteUser: async (id) => {
            const user = await database
                .delete(schema.user)
                .where(eq(schema.user.id, id))
                .returning()
            return user[0]
        },
        unlinkAccount: async (data) => {
            const account = await database
                .delete(schema.account)
                .where(
                    and(
                        eq(
                            schema.account.providerAccountId,
                            data.providerAccountId,
                        ),
                        eq(schema.account.provider, data.provider),
                    ),
                )
                .returning()

            return account[0] as AdapterAccount
        },
    }
}
