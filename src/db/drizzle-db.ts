import { connect } from '@planetscale/database'
import { drizzle } from 'drizzle-orm/planetscale-serverless'
import * as schema from './schema'
import { env } from '~/config/env.mjs'

// Create the connection.
const connection = connect({
    host: env.DB_HOST,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    fetch(input, init) {
        return fetch(input, { ...init, cache: 'default' })
    },
})

export const db = drizzle(connection, {
    logger: env.NODE_ENV === 'development' ? true : false,
    schema,
})
