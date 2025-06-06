import {db} from "@/lib/db/client";
import {users, teams} from "@/lib/db/schema";
import {eq} from "drizzle-orm";

export async function getUsers(){
    const result = await db
        .select({
            user: users,
            team: teams,
        })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))

    if (result.length === 0) return [];

    return result.map(({ user, team }) => ({
        ...user,
        team,
    }));
}

export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    return result[0] ?? null;
}

export async function getUserById(id: number) {
    const result = await db
        .select({
            user: users,
            team: teams,
        })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))
        .where(eq(users.id, id));

    if (result.length === 0) return null;

    const { user, team } = result[0];
    return {
        ...user,
        team,
    };
}

export async function getUsersByTeamId(teamId: number) {
    const result = await db
        .select({
            user: users,
            team: teams,
        })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))
        .where(eq(users.teamId, teamId));

    if (result.length === 0) return [];

    return result.map(({ user, team }) => ({
        ...user,
        team,
    }));
}

export async function updateUser(data: { id: number; name: string; username: string; email: string; teamId: number; }){
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.teamId !== undefined) updateData.teamId = data.teamId;

    const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, data.id))
        .returning();

    return updated;
}

export async function deleteUserById(id: number) {
    await db.delete(users).where(eq(users.id, id))
}

export async function createUser(data: { username: string; name: string; email: string; teamId: number; }){
    const [createdUser] = await db
        .insert(users)
        .values({
            username: data.username,
            name: data.name,
            email: data.email,
            teamId: data.teamId,
        })
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            teamId: users.teamId
        });

    return createdUser;
}
