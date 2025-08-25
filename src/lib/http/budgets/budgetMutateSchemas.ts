import {z} from "zod";
import {zId, zMoney, zMonth, zTeamId} from "@/lib/http/shared/schemas";
import {zCategoryIdParam} from "@/lib/http/teams/commonSchemas";

export const UpdateBudgetQuery = z.object({
    id: zId,
});
export type UpdateBudgetQueryInput = z.infer<typeof UpdateBudgetQuery>;

export const UpdateBudgetBody = z.object({
    teamId: zTeamId,
    amount: zMoney,
    month: zMonth,
    categoryId: zCategoryIdParam,
    rollover: z.boolean().optional().default(false),
})

export type UpdateBudgetBodyInput = z.infer<typeof UpdateBudgetBody>;

export const DeleteBudgetQuery = z.object({
    id: zId,
    teamId: zTeamId,
});
export type DeleteBudgetQueryInput = z.infer<typeof DeleteBudgetQuery>;
