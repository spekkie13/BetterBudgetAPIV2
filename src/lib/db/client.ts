import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
    pool?: Pool;
    db?: ReturnType<typeof drizzle>;
};

const pool =
    globalForDb.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30_000,
    });

const db =
    globalForDb.db ??
    drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool;
    globalForDb.db = db;
}

export { db, pool };
