import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { results } from "@/db/schema";
import { z } from "zod";
import { zCents, zId, zMaybeId } from "@/db/types/common";

export type ResultRow = InferSelectModel<typeof results>;
export type ResultInsert = InferInsertModel<typeof results>;
export type ResultPatch = Partial<Pick<ResultInsert, 'budgetedCents' | 'actualCents' | 'carryoverCents'>>;

export const ResultBody = z.object({
    periodId: zId,
    categoryId: zId,
    budgetedCents: zCents.default(0),
    actualCents: zCents.default(0),
    carryoverCents: zCents.default(0),
});

export const ResultPatchBody = z.object({
    budgetedCents: zCents.optional(),
    actualCents: zCents.optional(),
    carryoverCents: zCents.optional(),
});

export const ResultQuery = z.object({
    periodId: zId,
    categoryId: zMaybeId,
});

export const ResultParams = z.object({ id: zId });

export type ResultBodyInput = z.infer<typeof ResultBody>;
export type ResultQueryInput = z.infer<typeof ResultQuery>;
export type ResultParamsInput = z.infer<typeof ResultParams>;