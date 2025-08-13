// services/teamService.ts
import { db } from '@/lib/db/client';
import { teams, users, memberships } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// ------------ Create ------------

export async function createTeam(data: { name: string; ownerUserId?: number }) {
    return db.transaction(async (tx) => {
        const [team] = await tx
            .insert(teams)
            .values({ name: data.name })
            .returning({ id: teams.id, name: teams.name, createdAt: teams.createdAt });

        if (data.ownerUserId) {
            await tx
                .insert(memberships)
                .values({ userId: data.ownerUserId, teamId: team.id, role: 'owner' });
        }

        return team;
    });
}

// ------------ Reads ------------

export async function getTeams() {
    return await db.select().from(teams);
}

export async function getTeamsForUser(userId: number) {
    return await db
        .select({
            teamId: teams.id,
            name: teams.name,
            role: memberships.role,
            joinedAt: memberships.joinedAt,
        })
        .from(memberships)
        .innerJoin(teams, eq(teams.id, memberships.teamId))
        .where(eq(memberships.userId, userId));
}

// Returns team + member list (users + role)
export async function getTeamWithMembers(teamId: number) {
    const teamRows = await db
        .select({ id: teams.id, name: teams.name, createdAt: teams.createdAt })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

    const team = teamRows[0];
    if (!team) return null;

    const members = await db
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

    return { team, members };
}

// If you want to keep the old name/signature:
export async function getTeamById(teamId: number) {
    return getTeamWithMembers(teamId);
}

// ------------ Membership management ------------

export async function addUserToTeam(params: { teamId: number; userId: number; role?: string }) {
    const [row] = await db
        .insert(memberships)
        .values({ teamId: params.teamId, userId: params.userId, role: params.role ?? 'member' })
        .onConflictDoNothing({ target: [memberships.userId, memberships.teamId] })
        .returning();
    return row ?? null; // null if already a member
}

export async function removeUserFromTeam(params: { teamId: number; userId: number }) {
    await db
        .delete(memberships)
        .where(and(eq(memberships.teamId, params.teamId), eq(memberships.userId, params.userId)));
}

export async function changeMemberRole(params: { teamId: number; userId: number; role: string }) {
    const [row] = await db
        .update(memberships)
        .set({ role: params.role })
        .where(and(eq(memberships.teamId, params.teamId), eq(memberships.userId, params.userId)))
        .returning();
    return row ?? null;
}

// Bulk helper (invite many by user IDs)
export async function addUsersToTeam(params: { teamId: number; userIds: number[]; role?: string }) {
    if (!params.userIds.length) return [];
    const values = params.userIds.map((uid) => ({
        teamId: params.teamId,
        userId: uid,
        role: params.role ?? 'member',
    }));
    return await db
        .insert(memberships)
        .values(values)
        .onConflictDoNothing({ target: [memberships.userId, memberships.teamId] })
        .returning();
}

// ------------ Update / Delete team ------------

export async function updateTeam(data: { id: number; name?: string }) {
    const patch: Record<string, any> = {};
    if (data.name !== undefined) patch.name = data.name;

    const [updated] = await db
        .update(teams)
        .set(patch)
        .where(eq(teams.id, data.id))
        .returning();
    return updated ?? null;
}

export async function deleteTeam(teamId: number) {
    // memberships have onDelete: 'cascade' in your schema, so deleting the team will remove them
    await db.delete(teams).where(eq(teams.id, teamId));
}

// ------------ Guards (handy in API routes) ------------

// Simple guard: does user belong to team?
export async function assertUserInTeam(userId: number, teamId: number) {
    const [m] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId)))
        .limit(1);
    if (!m) throw new Error('Forbidden: user is not a member of this team');
}

// Optional: assert user has one of the allowed roles
export async function assertUserHasRole(userId: number, teamId: number, roles: string[] = ['owner', 'admin']) {
    const [m] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId)))
        .limit(1);
    if (!m || !roles.includes(m.role)) throw new Error('Forbidden: insufficient role');
}
