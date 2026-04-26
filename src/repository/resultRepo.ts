import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { results } from "@/db/schema/results";
import { ResultInsert, ResultPatch, ResultRow } from "@/db/types/resultTypes";
import { ResultNotFoundError } from "@/models/errors/result/NotFound";
import { ResultNotFoundForTeamError } from "@/models/errors/result/NotFoundForTeam";
import { IResultRepository } from "@/repository/interfaces/IResultRepository";

export class ResultRepository implements IResultRepository {
    async upsert(data: ResultInsert): Promise<ResultRow> {
        const [row] = await db
            .insert(results)
            .values(data)
            .onConflictDoUpdate({
                target: [results.periodId, results.categoryId],
                set: {
                    budgetedCents: data.budgetedCents,
                    actualCents: data.actualCents,
                    carryoverCents: data.carryoverCents,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return row;
    }

    async getById(teamId: number, id: number): Promise<ResultRow> {
        const [row] = await db
            .select()
            .from(results)
            .where(and(eq(results.teamId, teamId), eq(results.id, id)))
            .limit(1);

        if (!row) throw new ResultNotFoundError(id);
        return row;
    }

    async listByPeriod(teamId: number, periodId: number): Promise<ResultRow[]> {
        return db
            .select()
            .from(results)
            .where(and(eq(results.teamId, teamId), eq(results.periodId, periodId)));
    }

    async getByPeriodAndCategory(teamId: number, periodId: number, categoryId: number): Promise<ResultRow> {
        const [row] = await db
            .select()
            .from(results)
            .where(
                and(
                    eq(results.teamId, teamId),
                    eq(results.periodId, periodId),
                    eq(results.categoryId, categoryId),
                )
            )
            .limit(1);

        if (!row) throw new ResultNotFoundForTeamError(teamId);
        return row;
    }

    async updateById(teamId: number, id: number, data: ResultPatch): Promise<ResultRow> {
        const [row] = await db
            .update(results)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(results.teamId, teamId), eq(results.id, id)))
            .returning();

        if (!row) throw new ResultNotFoundError(id);
        return row;
    }

    async deleteById(teamId: number, id: number): Promise<void> {
        await db
            .delete(results)
            .where(and(eq(results.teamId, teamId), eq(results.id, id)));
    }
}

export const resultRepository = new ResultRepository();