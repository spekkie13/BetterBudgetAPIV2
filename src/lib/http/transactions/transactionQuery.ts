// lib/http/transactions/transactionQuery.ts
import { z } from 'zod';

export const TransactionQuery = z.object({
    teamId: z.string().transform(Number),
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    categoryId: z.string().transform(v => (v === '' || v == null ? undefined : Number(v))).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(200)).default('50' as any),
    cursor: z.string().nullable().optional(), // encoded as "ISO_TS:id"
    id: z.string().transform(v => (v === '' || v == null ? undefined : Number(v))).optional(),
});

export type TransactionQueryInput = z.infer<typeof TransactionQuery>;
