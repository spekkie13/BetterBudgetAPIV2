import { z } from 'zod';
import { zTeamId, zMaybeId, zMonth, zMoney } from '@/lib/http/shared/schemas';

export const BudgetQuery = z.object({
    teamId: zTeamId,                // required
    budgetId: zMaybeId,             // optional
    categoryId: zMaybeId,           // optional
    month: zMonth.optional(),       // optional (required for some paths)
});

export type BudgetQueryInput = z.infer<typeof BudgetQuery>;

export const CreateBudgetBody = z.object({
    teamId: zTeamId,
    categoryId: zTeamId,            // same integer rules as ids
    month: zMonth,
    amount: zMoney,                 // major units (your service converts if needed)
    rollover: z.boolean().optional().default(false),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetBody>;
