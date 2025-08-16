import { db } from '@/lib/db/client';
import { memberships, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Minimal insert (no conflict handling).
 */
export async function insert(values: {
    userId: number;
    teamId: number;
    role: string;
    joinedAt: Date;
}) {
    const [row] = await db.insert(memberships).values(values).returning();
    return row;
}

/**
 * Insert, ignoring duplicates on (userId, teamId).
 * Returns inserted row, or null if it already existed.
 */
export async function insertOnConflictIgnore(values: {
    userId: number;
    teamId: number;
    role: string;
    joinedAt: Date;
}) {
    const rows = await db
        .insert(memberships)
        .values(values)
        .onConflictDoNothing({ target: [memberships.userId, memberships.teamId] })
        .returning();
    return rows[0] ?? null;
}

/**
 * Bulk insert, ignoring duplicates on (userId, teamId).
 * Returns only the rows that were actually inserted.
 */
export async function insertManyOnConflictIgnore(values: Array<{
    userId: number;
    teamId: number;
    role: string;
    joinedAt: Date;
}>) {
    if (values.length === 0) return [];
    return db
        .insert(memberships)
        .values(values)
        .onConflictDoNothing({ target: [memberships.userId, memberships.teamId] })
        .returning();
}

/**
 * Delete a membership by (teamId, userId).
 */
export async function deleteByComposite(teamId: number, userId: number): Promise<void> {
    await db
        .delete(memberships)
        .where(and(eq(memberships.teamId, teamId), eq(memberships.userId, userId)));
}

/**
 * Update a member's role.
 * Returns updated row, or null if not found.
 */
export async function updateRole(teamId: number, userId: number, role: string) {
    const [row] = await db
        .update(memberships)
        .set({ role })
        .where(and(eq(memberships.teamId, teamId), eq(memberships.userId, userId)))
        .returning();
    return row ?? null;
}

/**
 * Check if a membership exists.
 */
export async function exists(userId: number, teamId: number): Promise<boolean> {
    const rows = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId)))
        .limit(1);
    return !!rows[0];
}

/**
 * Get a member's role (or null if not a member).
 */
export async function getRole(userId: number, teamId: number): Promise<string | null> {
    const rows = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId)))
        .limit(1);
    return rows[0]?.role ?? null;
}

/**
 * Return all members for a team with user details.
 * Matches the shape expected by TeamWithMembersDTO.members.
 */
export async function selectMembersWithUserByTeam(teamId: number) {
    return db
        .select({
            userId: users.id,
            email: users.email,
            username: users.username,
            name: users.name,
            role: memberships.role,
            joinedAt: memberships.joinedAt,
        })
        .from(memberships)
        .innerJoin(users, eq(users.id, memberships.userId))
        .where(eq(memberships.teamId, teamId));
}
