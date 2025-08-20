import { db } from '@/lib/db/client';
import { accounts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import type { AccountInsert, AccountRow } from '@/lib/domain/account';

/** Create an account (DB enforces ux_account_team_name). */
export async function insert(values: AccountInsert): Promise<AccountRow> {
    const [row] = await db.insert(accounts).values(values).returning();
    return row;
}

/** Get by id (unguarded). */
export async function selectById(id: number): Promise<AccountRow | null> {
    const rows = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    return rows[0] ?? null;
}

/** Get by (teamId, id). Use this variant wherever you need team-guarding. */
export async function selectByIdTeam(teamId: number, id: number): Promise<AccountRow | null> {
    const rows = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.teamId, teamId)))
        .limit(1);
    return rows[0] ?? null;
}

/** List accounts for a team. */
export async function selectAllByTeam(teamId: number): Promise<AccountRow[]> {
    return db.select().from(accounts).where(eq(accounts.teamId, teamId));
}

/** Update any subset of {name,type, currency, isArchived}, guarded by a team. */
export async function updateByIdTeam(
    teamId: number,
    id: number,
    patch: Partial<AccountInsert>
): Promise<AccountRow | null> {
    const [row] = await db
        .update(accounts)
        .set(patch)
        .where(and(eq(accounts.id, id), eq(accounts.teamId, teamId)))
        .returning();
    return row ?? null;
}

/** Delete an entry (hard) guarded by a team. Consider preferring isArchived=true in most flows. */
export async function deleteByIdTeam(teamId: number, id: number): Promise<void> {
    await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.teamId, teamId)));
}

/** Fast existence guard. */
export async function exists(teamId: number, id: number): Promise<boolean> {
    const rows = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.teamId, teamId)))
        .limit(1);
    return !!rows[0];
}

/** Currency lookup used by transactionService. */
export async function getCurrency(accountId: number): Promise<string | null> {
    const [row] = await db
        .select({ currency: accounts.currency })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);
    return row?.currency ?? null;
}
