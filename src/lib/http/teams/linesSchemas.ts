import { z } from 'zod';
import { zTeamIdParam, zCategoryIdParam, zMonth, zLimit, zCursor2 } from './commonSchemas';

export const LinesParams = z.object({
    teamId: zTeamIdParam,
    categoryId: zCategoryIdParam,
});

export const LinesQuery = z.object({
    month: zMonth,
    limit: zLimit,
    cursor: zCursor2, // "ISO:id"
});

export type LinesParamsInput = z.infer<typeof LinesParams>;
export type LinesQueryInput = z.infer<typeof LinesQuery>;
