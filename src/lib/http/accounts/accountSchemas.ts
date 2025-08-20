import { z } from 'zod';
import {zId, zTeamId} from "@/lib/http/shared/schemas";

export const zCurrency = z.enum(['EUR','USD','GBP','JPY','CAD','AUD','NZD']);
export const zType = z.string().trim().min(1); // e.g. 'bank' | 'cash' | 'credit' | ...

/** Route params */
export const AccountsParams = z.object({ teamId: zTeamId });
export const AccountIdParams = z.object({ teamId: zTeamId, id: zId });

/** Collection query (?includeArchived=true|false) */
export const AccountsQuery = z.object({
    includeArchived: z
        .union([z.string(), z.boolean()])
        .optional()
        .transform((v) => {
            if (typeof v === 'boolean') return v;
            if (v == null) return true; // default include archived
            return v.toLowerCase() === 'true';
        }),
});
export type AccountsQueryInput = z.infer<typeof AccountsQuery>;

/** Create body */
export const CreateAccountBody = z.object({
    name: z.string().trim().min(1),
    type: zType,
    currency: zCurrency.optional(), // DB default to 'EUR' when omitted
}).strict();
export type CreateAccountInput = z.infer<typeof CreateAccountBody>;

/** Update body (partial, but at least one key) */
export const UpdateAccountBody = z.object({
    name: z.string().trim().min(1).optional(),
    type: zType.optional(),
    currency: zCurrency.optional(),
    isArchived: z.boolean().optional(),
})
    .refine(obj => Object.keys(obj).length > 0, { message: 'No fields to update' })
    .strict();
export type UpdateAccountInput = z.infer<typeof UpdateAccountBody>;
