import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {txn} from "@/db/schema";
import {z} from "zod";
import {zBoolish, zCents, zCurrency, zDateTime, zId, zMaybeId, zTeamId, zType50} from "@/db/types/common";

/** all db Transaction types */
export type TransactionRow = InferSelectModel<typeof txn>;
export type TransactionInsert = InferInsertModel<typeof txn>;
export type TransactionPatch = Partial<Pick<TransactionInsert, 'amountCents' | 'currency' | 'postedAt' | 'payee' | 'memo' | 'categoryId' | 'isTransfer' | 'transferGroupId' | 'createdBy' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

export const TransactionQuery = z.object({
    id: zId,
    teamId: zTeamId,
    accountId: zId,
    categoryId: zId,
    postedAt: zDateTime,
});
export type TransactionQueryInput = z.infer<typeof TransactionQuery>;

/** Parse route input to verify correctness */
export const TransactionParams = z.object({
    id: zMaybeId,
    type: z.enum(['income', 'expense', 'transfer', '']).nullable().optional()
});
export type TransactionParamsInput = z.infer<typeof TransactionParams>;

/** Collection query */
export const TransactionBody = z.object({
    id: zId,
    teamId: zTeamId,
    accountId: zId,
    amountCents: zCents,
    currency: zCurrency,
    postedAt: zDateTime,
    payee: zType50,
    memo: zType50,
    categoryId: zId,
    isTransfer: zBoolish,
    transferGroupId: zId,
    createdBy: zId,
    createdAt: zDateTime,
    updatedAt: zDateTime,
    deletedAt: zDateTime,
    cursor: z.string().nullable().optional(),
    month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM').optional(),
    mode: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
})
export type TransactionBodyInput = z.infer<typeof TransactionBody>;
