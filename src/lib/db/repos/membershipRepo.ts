import { db } from '@/db/client';
import { memberships, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeMembershipRepo() {
    const base = makeTeamScopedRepo(db, memberships, {userId: memberships.userId}, memberships.teamId)

    return {
        ...base,

        async insertManyOnConflictIgnore(values: Array<{
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
        },

        async updateRole(teamId: number, userId: number, role: string) {
            const [row] = await db
                .update(memberships)
                .set({ role })
                .where(and(eq(memberships.teamId, teamId), eq(memberships.userId, userId)))
                .returning();
            return row ?? null;
        },

        async getRole(userId: number, teamId: number): Promise<string | null> {
            const rows = await db
                .select({ role: memberships.role })
                .from(memberships)
                .where(and(eq(memberships.userId, userId), eq(memberships.teamId, teamId)))
                .limit(1);
            return rows[0]?.role ?? null;
        },

        async selectMembersWithUserByTeam(teamId: number) {
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

    }
}
