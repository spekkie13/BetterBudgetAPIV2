import { z } from 'zod';
import { zTeamIdParam, zMonth } from './commonSchemas';

export const BudgetParams = z.object({ teamId: zTeamIdParam });
export const BudgetQuery = z.object({ month: zMonth });

export type BudgetParamsInput = z.infer<typeof BudgetParams>;
export type BudgetQueryInput = z.infer<typeof BudgetQuery>;
