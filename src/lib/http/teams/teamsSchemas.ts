import { z } from 'zod';

export const TeamsQuery = z.object({
    teamId: z.union([z.string(), z.number()]).transform(n => n === '' || n == null ? undefined : Number(n))
        .refine(v => v === undefined || Number.isInteger(v), 'Invalid teamId')
        .optional(),
});
export type TeamsQueryInput = z.infer<typeof TeamsQuery>;

export const CreateTeamBody = z.object({
    name: z.string().trim().min(1, 'Missing team name'),
});
export type CreateTeamBodyInput = z.infer<typeof CreateTeamBody>;
