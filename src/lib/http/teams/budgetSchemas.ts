import { z } from 'zod';
import { zTeamIdParam, zMonth } from './commonSchemas';
import {zId} from "@/lib/http/shared/schemas";

export const BudgetParams = z.object({ teamId: zTeamIdParam, id: zId });
export const BudgetQuery = z.object({ month: zMonth });

export type BudgetParamsInput = z.infer<typeof BudgetParams>;
export type BudgetQueryInput = z.infer<typeof BudgetQuery>;
