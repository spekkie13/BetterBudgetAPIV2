import { z } from 'zod';
import { zId, zTeamId } from '@/lib/http/shared/schemas';

// Query (?id=...) for PUT
export const UpdateCategoryQuery = z.object({
    id: zId,
});
export type UpdateCategoryQueryInput = z.infer<typeof UpdateCategoryQuery>;

// Body for PUT (partial update). Require teamId for guarding.
// Enforce that at least one updatable field is provided.
export const UpdateCategoryBody = z.object({
    teamId: zTeamId,
    name: z.string().trim().min(1).optional(),
    color: z.string().trim().min(1).optional(),
    icon: z.string().trim().min(1).optional(),
    type: z.enum(['expense', 'income', 'transfer']).optional(),
    // normalize parentId to number|null if present
    parentId: z
        .union([z.number().int(), z.string(), z.null(), z.undefined()])
        .transform(v => (v === '' || v == null ? undefined : Number(v)))
        .refine(v => v === undefined || Number.isInteger(v), 'Invalid parentId')
        .optional(),
})
    .refine(
        (v) => v.name != null || v.color != null || v.icon != null || v.type != null || v.parentId !== undefined,
        { message: 'No updatable fields provided' }
    );
export type UpdateCategoryBodyInput = z.infer<typeof UpdateCategoryBody>;

// Query for DELETE (?id=&teamId=)
export const DeleteCategoryQuery = z.object({
    id: zId,
    teamId: zTeamId,
});
export type DeleteCategoryQueryInput = z.infer<typeof DeleteCategoryQuery>;
