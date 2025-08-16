import { z } from 'zod';
import { zTeamId, zMaybeId } from '@/lib/http/shared/schemas';

export const CategoryQuery = z.object({
    teamId: zTeamId,                // required
    id: zMaybeId,                   // optional: fetch by id
    name: z.string().trim().min(1).optional(), // optional: fetch by name (case rules handled in service)
});

export type CategoryQueryInput = z.infer<typeof CategoryQuery>;

// Keep POST flexible: validate the essentials and allow extra keys so we don’t break the service.
// If your service has a stricter contract, encode it here.
// Helpers
const zNonEmpty = z.string().trim().min(1, 'Required');

export const CreateCategoryBody = z.object({
    teamId: zTeamId,
    name: zNonEmpty,
    color: zNonEmpty,
    icon: zNonEmpty,
    type: z.enum(['expense', 'income', 'transfer']).optional().default('expense'),
    // Accept number | string | null/undefined; normalize to number|null for the service
    parentId: z
        .union([z.number().int(), z.string(), z.null(), z.undefined()])
        .transform(v => (v === '' || v == null ? null : Number(v)))
        .refine(v => v === null || Number.isInteger(v), 'Invalid parentId')
        .optional(),
}).strict(); // disallow unknown keys

export type CreateCategoryInput = z.infer<typeof CreateCategoryBody>;
