// services/userService.ts
import { db } from '@/db/client';
import {users, teams, memberships, accounts} from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

// Types
type TeamLite = { id: number; name: string };
type UserLite = { id: number; email: string; username: string; name: string; createdAt: Date };
export type UserWithTeams = UserLite & { teams: TeamLite[] };
export type AccountRow = typeof accounts.$inferSelect;

// ---------- internal helper ----------
async function teamsForUserIds(userIds: number[]): Promise<Map<number, TeamLite[]>> {
    if (!userIds.length) return new Map();
    const rows = await db
        .select({ userId: memberships.userId, teamId: teams.id, teamName: teams.name })
        .from(memberships)
        .innerJoin(teams, eq(teams.id, memberships.teamId))
        .where(inArray(memberships.userId, userIds));
    const map = new Map<number, TeamLite[]>();
    for (const r of rows) {
        if (!map.has(r.userId)) map.set(r.userId, []);
        map.get(r.userId)!.push({ id: r.teamId, name: r.teamName });
    }
    return map;
}

// ---------- Reads ----------
export async function getUsers(): Promise<UserWithTeams[]> {
    const rows = await db.select({
        id: users.id, email: users.email, username: users.username, name: users.name, createdAt: users.createdAt,
    }).from(users);
    const tmap = await teamsForUserIds(rows.map(r => r.id));
    return rows.map(u => ({ ...u, teams: tmap.get(u.id) ?? [] }));
}

export async function getUserByEmail(email: string): Promise<UserWithTeams | null> {
    const [u] = await db.select({
        id: users.id, email: users.email, username: users.username, name: users.name, createdAt: users.createdAt,
    }).from(users).where(eq(users.email, email)).limit(1);
    if (!u) return null;
    const ts = await db.select({ id: teams.id, name: teams.name })
        .from(memberships).innerJoin(teams, eq(teams.id, memberships.teamId))
        .where(eq(memberships.userId, u.id));
    return { ...u, teams: ts };
}

export async function getUserById(id: number): Promise<UserWithTeams | null> {
    const [u] = await db.select({
        id: users.id, email: users.email, username: users.username, name: users.name, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id)).limit(1);
    if (!u) return null;
    const ts = await db.select({ id: teams.id, name: teams.name })
        .from(memberships).innerJoin(teams, eq(teams.id, memberships.teamId))
        .where(eq(memberships.userId, u.id));
    return { ...u, teams: ts };
}

export async function getUsersByTeamId(teamId: number): Promise<UserWithTeams[]> {
    const base = await db.select({
        id: users.id, email: users.email, username: users.username, name: users.name, createdAt: users.createdAt,
    }).from(memberships).innerJoin(users, eq(users.id, memberships.userId))
        .where(eq(memberships.teamId, teamId));
    const tmap = await teamsForUserIds(base.map(u => u.id));
    return base.map(u => ({ ...u, teams: tmap.get(u.id) ?? [] }));
}

// ---------- Mutations (user row) ----------
export async function createUser(data: { username: string; name: string; email: string }) {
    const [created] = await db.insert(users).values(data).returning({
        id: users.id, username: users.username, name: users.name, email: users.email, createdAt: users.createdAt,
    });
    return created;
}

export async function updateUser(data: { id: number; name?: string; username?: string; email?: string }) {
    const patch: Record<string, any> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.username !== undefined) patch.username = data.username;
    if (data.email !== undefined) patch.email = data.email;
    const [updated] = await db.update(users).set(patch).where(eq(users.id, data.id)).returning({
        id: users.id, username: users.username, name: users.name, email: users.email, createdAt: users.createdAt,
    });
    return updated ?? null;
}

export async function deleteUserById(id: number) {
    await db.delete(users).where(eq(users.id, id));
}

// ---------- Membership helpers ----------
export async function addUserToTeam(params: { userId: number; teamId: number; role?: string }) {
    const [row] = await db.insert(memberships)
        .values({ userId: params.userId, teamId: params.teamId, role: params.role ?? 'member' })
        .onConflictDoNothing({ target: [memberships.userId, memberships.teamId] })
        .returning();
    return row ?? null;
}
export async function removeUserFromTeam(params: { userId: number; teamId: number }) {
    await db.delete(memberships).where(and(eq(memberships.userId, params.userId), eq(memberships.teamId, params.teamId)));
}
export async function changeUserRoleInTeam(params: { userId: number; teamId: number; role: string }) {
    const [row] = await db.update(memberships).set({ role: params.role })
        .where(and(eq(memberships.userId, params.userId), eq(memberships.teamId, params.teamId))).returning();
    return row ?? null;
}

// ---------- Auth/bootstrap helpers (moved from appUserService) ----------
export async function ensureAppUser(params: { email: string; username?: string; name?: string }) {
    const [found] = await db.select().from(users).where(eq(users.email, params.email)).limit(1);
    if (found) return found;
    const [created] = await db.insert(users).values({
        email: params.email,
        username: params.username ?? params.email.split('@')[0],
        name: params.name ?? params.email.split('@')[0],
    }).returning();
    return created;
}

export async function ensurePersonalTeam(userId: number) {
    const [m] = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1);
    if (m) return null;
    return db.transaction(async (tx) => {
        const [team] = await tx.insert(teams).values({ name: 'My Budget' })
            .returning({ id: teams.id, name: teams.name });
        await tx.insert(memberships).values({ userId, teamId: team.id, role: 'owner' });
        return team;
    });
}

export async function getSessionProfile(userId: number) {
    const user = await getUserById(userId);
    if (!user) return null;
    const members = await db.select({ teamId: memberships.teamId, role: memberships.role })
        .from(memberships).where(eq(memberships.userId, userId));
    return {
        user: { id: user.id, email: user.email, name: user.name, username: user.username },
        memberships: members,
        defaultTeamId: members[0]?.teamId ?? null,
    };
}

export async function assertUserInTeam(userId: number, teamId: number) {
    const [m] = await db.select().from(memberships)
        .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId))).limit(1);
    if (!m) throw new Error('Forbidden: user not in team');
}

type CreateAccountInput = {
    teamId: number;
    name: string;
    type: string; // 'bank' | 'cash' | 'credit' | ...
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'NZD';
};

type UpdateAccountInput = {
    id: number;
    name?: string;
    type?: string;
    currency?: CreateAccountInput['currency'];
    isArchived?: boolean;
};

export async function createAccount(data: CreateAccountInput) {
    const [row] = await db
        .insert(accounts)
        .values({
            teamId: data.teamId,
            name: data.name,
            type: data.type,
            currency: data.currency,
        })
        .returning();
    return row;
}

export async function getAccountsByTeamId(teamId: number) {
    return db
        .select()
        .from(accounts)
        .where(eq(accounts.teamId, teamId));
}

export async function getAccountById(id: number) {
    const rows = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1);
    return rows[0] ?? null;
}

export async function getAccounts(options?: {
    teamId?: number;
    includeArchived?: boolean;
}): Promise<AccountRow[]> {
    const teamId = options?.teamId;
    const includeArchived = options?.includeArchived ?? true;

    // Build conditions once, then apply .where(and(...))
    const conditions = [];
    if (teamId !== undefined) conditions.push(eq(accounts.teamId, teamId));
    if (!includeArchived) conditions.push(eq(accounts.isArchived, false));

    const base = db.select().from(accounts);
    if (conditions.length) {
        return await base.where(and(...conditions));
    }
    return await base;
}

export async function updateAccount(data: UpdateAccountInput) {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.type !== undefined) patch.type = data.type;
    if (data.currency !== undefined) patch.currency = data.currency;
    if (data.isArchived !== undefined) patch.isArchived = data.isArchived;

    const [row] = await db
        .update(accounts)
        .set(patch)
        .where(eq(accounts.id, data.id))
        .returning();
    return row ?? null;
}

export async function deleteAccount(id: number) {
    await db.delete(accounts).where(eq(accounts.id, id));
}
