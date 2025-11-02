import { z } from 'zod';
import {zId, zLimit, zMonth, zTeamId} from "@/db/types/common";
import {zCursor2} from "@/core/cursor";

export const LinesParams = z.object({
    categoryId: zId,
});

export const LinesQuery = z.object({
    month: zMonth,
    limit: zLimit,
    cursor: zCursor2, // "ISO:id"
});

export type LinesParamsInput = z.infer<typeof LinesParams>;
export type LinesQueryInput = z.infer<typeof LinesQuery>;
