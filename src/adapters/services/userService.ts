import { db } from '@/db/client';
import {users, teams, memberships} from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import {KeyedRepoServiceBase} from "@/adapters/services/factory/keyedRepoServiceBase";
import {UserInsert, UserPatch, UserRow} from "@/db/types/userTypes";
import {makeUserRepo} from "@/adapters/repo/userRepo";

export class UserService extends KeyedRepoServiceBase<UserRow, number, UserInsert, UserPatch> {
    constructor(){
        super(makeUserRepo())
    }

    async selectByEmail(email: string) {
        const [u] = await db.select({
            id: users.id,
            email: users.email,
            username: users.username,
            name: users.name,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (!u) return null;
        const ts = await db.select({ id: teams.id, name: teams.name })
            .from(memberships).innerJoin(teams, eq(teams.id, memberships.teamId))
            .where(eq(memberships.userId, u.id));
        return { ...u, teams: ts };
    }

    async selectByTeamId(teamId: number) {
        const base = await db.select({
            id: users.id, email: users.email, username: users.username, name: users.name, createdAt: users.createdAt,
        }).from(memberships).innerJoin(users, eq(users.id, memberships.userId))
            .where(eq(memberships.teamId, teamId));
        const tmap = await teamsForUserIds(base.map(u => u.id));
        return base.map(u => ({ ...u, teams: tmap.get(u.id) ?? [] }));
    }

    async createUser(data: { username: string; name: string; email: string }) {
        const [created] = await db.insert(users).values(data).returning({
            id: users.id, username: users.username, name: users.name, email: users.email, createdAt: users.createdAt,
        });
        return created;
    }
}

// Types
type TeamLite = { id: number; name: string };
type UserLite = { id: number; email: string; username: string; name: string; createdAt: Date };
export type UserWithTeams = UserLite & { teams: TeamLite[] };

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
