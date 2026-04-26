import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { periods } from "@/db/schema/periods";
import { PeriodInsert, PeriodPatch, PeriodRow } from "@/db/types/periodTypes";
import { PeriodNotFoundError } from "@/models/errors/period/NotFound";
import { IPeriodRepository } from "@/repository/interfaces/IPeriodRepository";

export class PeriodRepository implements IPeriodRepository {
    async create(data: PeriodInsert): Promise<PeriodRow> {
        const [row] = await db
            .insert(periods)
            .values(data)
            .returning();

        return row;
    }

    async getById(teamId: number, id: number): Promise<PeriodRow> {
        const [row] = await db
            .select()
            .from(periods)
            .where(and(eq(periods.teamId, teamId), eq(periods.id, id)))
            .limit(1);

        if (!row) throw new PeriodNotFoundError(id);
        return row;
    }

    async listByTeam(teamId: number): Promise<PeriodRow[]> {
        return db.select().from(periods).where(eq(periods.teamId, teamId));
    }

    async listByStatus(teamId: number, status: string): Promise<PeriodRow[]> {
        return db
            .select()
            .from(periods)
            .where(and(eq(periods.teamId, teamId), eq(periods.status, status as PeriodRow['status'])));
    }

    async updateById(teamId: number, id: number, data: PeriodPatch): Promise<PeriodRow> {
        const [row] = await db
            .update(periods)
            .set(data)
            .where(and(eq(periods.teamId, teamId), eq(periods.id, id)))
            .returning();

        if (!row) throw new PeriodNotFoundError(id);
        return row;
    }

    async deleteById(teamId: number, id: number): Promise<void> {
        await db
            .delete(periods)
            .where(and(eq(periods.teamId, teamId), eq(periods.id, id)));
    }
}

export const periodRepository = new PeriodRepository();