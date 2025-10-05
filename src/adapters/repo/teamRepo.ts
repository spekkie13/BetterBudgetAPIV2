import { db } from '@/db/client';
import { teams, memberships } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {TeamInsert, TeamRow} from "@/db/types/teamTypes";
import {makeKeyedRepo} from "@/adapters/repo/factory/makeKeyedRepo";

export function makeTeamRepo() {
    return makeKeyedRepo(db, teams, teams.id);
}

/**
 * Insert a new team.
 */
export async function insert(values: TeamInsert): Promise<TeamRow> {
    const [row] = await db.insert(teams).values(values).returning();
    return row;
}

/**
 * Get all teams.
 */
export async function selectAll(): Promise<TeamRow[]> {
    return db.select().from(teams);
}

/**
 * Get all teams where the given user is a member.
 */
export async function selectAllByUser(userId: number): Promise<TeamRow[]> {
    return db
        .select({
            id: teams.id,
            name: teams.name,
            createdAt: teams.createdAt,
        })
        .from(teams)
        .innerJoin(memberships, eq(memberships.teamId, teams.id))
        .where(eq(memberships.userId, userId));
}

/**
 * Get a single team by ID.
 * (Returns id, name, createdAt to match TeamWithMembersDTO.team)
 */
export async function selectById(teamId: number): Promise<{ id: number; name: string; createdAt: Date } | null> {
    const rows = await db
        .select({ id: teams.id, name: teams.name, createdAt: teams.createdAt })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    return rows[0] ?? null;
}

/**
 * Update a team by ID.
 */
export async function updateById(id: number, patch: Partial<TeamInsert>): Promise<TeamRow | null> {
    const [row] = await db.update(teams).set(patch).where(eq(teams.id, id)).returning();
    return row ?? null;
}
