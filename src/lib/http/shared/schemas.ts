import { z } from 'zod';

// Reusable Zod atoms
export const zTeamId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid teamId');

export const zId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid id');

export const zMaybeId = z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === '' || v == null ? undefined : Number(v)))
    .refine(v => v === undefined || Number.isInteger(v), 'Invalid id');

export const zMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month (YYYY-MM)');

export const zMoney = z.union([z.string(), z.number()])
    .transform(Number)
    .refine(Number.isFinite, 'Invalid amount');
