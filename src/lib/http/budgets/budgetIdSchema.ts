import { z } from 'zod';
import { zTeamId, zMonth, zMoney } from '@/lib/http/shared/schemas';

export const UpdateBudgetBody = z.object({
    teamId: zTeamId,
    categoryId: zTeamId,
    month: zMonth,          // "YYYY-MM"
    amount: zMoney,         // major units; service may convert
    rollover: z.boolean().optional().default(false),
});

export type UpdateBudgetInput = z.infer<typeof UpdateBudgetBody>;

export const DeleteBudgetInput = z.object({
    teamId: zTeamId,
});
export type DeleteBudgetInput = z.infer<typeof DeleteBudgetInput>;
