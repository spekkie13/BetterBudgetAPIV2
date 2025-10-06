// lib/db/client.ts
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

type GlobalDb = {
    pool?: Pool;
    db?: NodePgDatabase<typeof schema>;
};

const globalForDb = globalThis as unknown as GlobalDb;

export const pool =
    globalForDb.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30_000,
    });

export const db: NodePgDatabase<typeof schema> =
    globalForDb.db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool;
    globalForDb.db = db;
}
