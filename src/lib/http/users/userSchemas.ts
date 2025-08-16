import { z } from 'zod';

// ---- atoms
export const zId = z.union([z.number().int(), z.string()]).transform(Number).refine(Number.isInteger, 'Invalid id');
export const zTeamId = z.union([z.number().int(), z.string()])
    .transform(v => (v === '' || v == null ? undefined : Number(v)))
    .refine(v => v === undefined || Number.isInteger(v), 'Invalid teamId');

// ---- collection GET
export const UsersQuery = z.object({
    userId: z.union([z.string(), z.number(), z.undefined()]).transform(v => (v == null ? undefined : Number(v)))
        .refine(v => v === undefined || Number.isInteger(v), 'Invalid userId'),
    teamId: zTeamId,
    email: z.string().email().optional(),
});
export type UsersQueryInput = z.infer<typeof UsersQuery>;

// ---- create
export const CreateUserBody = z.object({
    email: z.string().email(),
    username: z.string().trim().min(1),
    name: z.string().trim().min(1),
}).strict();
export type CreateUserInput = z.infer<typeof CreateUserBody>;

// ---- item params
export const UserIdParams = z.object({ id: zId });
export type UserIdParamsInput = z.infer<typeof UserIdParams>;

// ---- update (partial, but at least one field)
export const UpdateUserBody = z.object({
    email: z.string().email().optional(),
    username: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
}).refine(b => Object.keys(b).length > 0, { message: 'No fields to update' }).strict();
export type UpdateUserInput = z.infer<typeof UpdateUserBody>;
