import { TeamInsert, TeamPatch, TeamRow } from "@/db/types/teamTypes";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ITeamRepository } from "@/repository/interfaces/ITeamRepository";

export class TeamRepository implements ITeamRepository {
    async create(data: TeamInsert) : Promise<TeamRow> {
        const [row] = await db
            .insert(teams)
            .values(data)
            .returning()

        return row;
    }

    async getById(id: number) : Promise<TeamRow> {
        const [row] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, id))
            .limit(1)

        return row;
    }

    async updateById(id: number, data: TeamPatch) : Promise<TeamRow> {
        const [row] = await db
            .update(teams)
            .set(data)
            .where(eq(teams.id, id))
            .returning()

        return row;
    }

    async deleteById(id: number) : Promise<void> {
        await db
            .delete(teams)
            .where(
                and(
                    eq(teams.id, id),
                )
            );
    }

    async selectAll(): Promise<TeamRow[]> {
        return await db
            .select()
            .from(teams)
            .limit(500);
    }
}

export const teamRepository = new TeamRepository();
