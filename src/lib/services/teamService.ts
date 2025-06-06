import {db} from "@/lib/db/client";
import {teams, users} from "@/lib/db/schema";
import {eq} from "drizzle-orm";

export async function createTeam(data: { name: string }) {
    const [createdTeam] = await db
        .insert(teams)
        .values({
            name: data.name,
        })
        .returning({
            id: teams.id,
            name: teams.name
        });

    return createdTeam;
}

export async function getTeams() {
    const result = await db
        .select()
        .from(teams)

    return result ?? null;
}

export async function getTeamById(teamId: number) {
    const teamWithUsers = await db
        .select({
            team: teams,
            user: users,
        })
        .from(teams)
        .leftJoin(users, eq(users.teamId, teams.id))
        .where(eq(teams.id, teamId));

    return teamWithUsers ?? null;
}

export async function updateTeam(data: { id: number; name?: string }) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;

    const [updated] = await db
        .update(teams)
        .set(updateData)
        .where(eq(teams.id, data.id))
        .returning();

    return updated;
}

export async function deleteTeam(teamId: number) {
    await db.delete(teams).where(eq(teams.id, teamId));
}
