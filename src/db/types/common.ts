import {z} from "zod";

export const zId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid id');

export const zUserId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid userId');

export const zTeamId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid teamId');

export const zMaybeId = zId.optional();

export const zMonth = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Invalid month (YYYY-MM or YYYY-MM-DD)').optional().nullable();
export const zMonths = z.coerce.number().int().min(1).max(36).default(6);

export const zCents = z.union([z.string(), z.number()])
    .transform(Number)
    .refine(Number.isFinite, 'Invalid amount');

export const zCurrency = z.enum(['EUR','USD','GBP','JPY','CAD','AUD','NZD']);
export const zType = z.string().trim().min(1); // e.g. 'bank' | 'cash' | 'credit' | ...
export const zType50 = zType.max(50).optional();
export const zName = z.string().trim().min(1, 'Name is required').max(255, 'Max length is 255');
export const zBoolish = z.coerce.boolean();
export const zDateTime = z.coerce.date();
export const zLimit = z.coerce.number().int().min(1).max(200).default(50);
export const zEmail = z.string().email();
