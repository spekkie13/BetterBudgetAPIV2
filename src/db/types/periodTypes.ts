import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { periods } from "@/db/schema";
import { z } from "zod";
import { zId, zMaybeId } from "@/db/types/common";

export type PeriodRow = InferSelectModel<typeof periods>;
export type PeriodInsert = InferInsertModel<typeof periods>;
export type PeriodPatch = Partial<Pick<PeriodInsert, 'status' | 'closingStatus' | 'closedAt'>>;

export const PeriodBody = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
    periodStartType: z.enum(['calendar_month', 'anchored_month']).default('calendar_month'),
});

export const PeriodPatchBody = z.object({
    status: z.enum(['open', 'closing', 'closed']).optional(),
    closingStatus: z.enum(['started', 'succeeded', 'failed']).nullable().optional(),
    closedAt: z.coerce.date().nullable().optional(),
});

export const PeriodQuery = z.object({
    status: z.enum(['open', 'closing', 'closed']).optional(),
});

export const PeriodParams = z.object({ id: zId });

export type PeriodBodyInput = z.infer<typeof PeriodBody>;
export type PeriodQueryInput = z.infer<typeof PeriodQuery>;
export type PeriodParamsInput = z.infer<typeof PeriodParams>;