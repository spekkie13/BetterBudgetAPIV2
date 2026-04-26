import {memberships, teams, users} from "@/db/schema";
import {db} from "@/db/client";
import {eq} from "drizzle-orm";
import {UserInsert, UserPatch, UserRow, UserWithTeamsRow, ProvisionBodyInput} from "@/db/types/userTypes";
import {IUserRepository} from "@/repository/interfaces/IUserRepository";
import {TeamRow} from "@/db/types/teamTypes";
import {UserAlreadyExistsError} from "@/models/errors";

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

    async provision(data: ProvisionBodyInput): Promise<{ userRow: UserRow; teamRow: TeamRow }> {
        try {
            return await db.transaction(async (tx) => {
                const [userRow] = await tx.insert(users).values(data).returning();
                const [teamRow] = await tx.insert(teams).values({ name: `${data.name}'s Budget` }).returning();
                await tx.insert(memberships).values({ userId: userRow.id, teamId: teamRow.id, role: 'owner' });
                return { userRow, teamRow };
            });
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505') {
                throw new UserAlreadyExistsError(data.email);
            }
            throw err;
        }
    }
}

export const userRepository = new UserRepository();
