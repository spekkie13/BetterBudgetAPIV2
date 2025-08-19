import { z } from 'zod';
import {zId} from "@/lib/http/shared/schemas";

// ---- atoms
const numOpt = z.preprocess(
    v => (v === '' || v == null ? undefined : v),
    z.coerce.number().int().optional()
)

const emailOpt = z.preprocess(
    v => (v === '' || v == null ? undefined : v),
    z.string().email().optional()
)

export const UsersQuery = z.object({
    userId: numOpt,   // ?userId=1
    teamId: numOpt,   // ?teamId=1
    email:  emailOpt, // ?email=foo@bar.com
})
    .superRefine((val, ctx) => {
        const provided = ['userId', 'teamId', 'email'].filter(k => (val as any)[k] !== undefined)
        if (provided.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide one of: userId, teamId or email.' })
        } else if (provided.length > 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide only one of: userId, teamId or email.' })
        }
    })
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
