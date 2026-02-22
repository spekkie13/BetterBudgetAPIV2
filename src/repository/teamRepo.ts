import { TeamInsert, TeamPatch, TeamRow } from "@/db/types/teamTypes";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {TeamNotFoundError} from "@/models/errors";

export class TeamRepository {
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
        const rows = await db
            .select()
            .from(teams)
            .limit(500);

        if (rows.length === 0) {
            throw new TeamNotFoundError()
        }

        return rows;
    }
}

export const teamRepository = new TeamRepository();
