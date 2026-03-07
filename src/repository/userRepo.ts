import {memberships, teams, users} from "@/db/schema";
import {db} from "@/db/client";
import {eq} from "drizzle-orm";
import {UserInsert, UserPatch, UserRow, UserWithTeamsRow} from "@/db/types/userTypes";
import {IUserRepository} from "@/repository/interfaces/IUserRepository";

export class UserRepository implements IUserRepository {
    async selectByToken(token: string): Promise<UserWithTeamsRow | null> {
        const [u] = await db.select({
            id: users.id,
            token: users.supabaseUid,
            email: users.email,
            username: users.username,
            name: users.name,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.supabaseUid, token))
            .limit(1);
        if (!u) return null;
        const ts = await db
            .select({ id: teams.id, name: teams.name })
            .from(memberships)
            .innerJoin(teams, eq(teams.id, memberships.teamId))
            .where(eq(memberships.userId, u.id));
        return { ...u, teams: ts };
    }

    async create(user: UserInsert) : Promise<UserRow> {
        const [row] = await db
            .insert(users)
            .values(user)
            .returning();

        return row;
    }

    async update(id: number, user: UserPatch) : Promise<UserRow> {
        const [row] = await db
            .update(users)
            .set(user)
            .where(eq(users.id, id))
            .returning();

        return row;
    }

    async delete(id: number) : Promise<void> {
        await db
            .delete(users)
            .where(eq(users.id, id));
    }
}

export const userRepository = new UserRepository();
