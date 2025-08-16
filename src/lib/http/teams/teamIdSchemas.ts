import { z } from 'zod';
import { zIdParam } from './commonSchemas';

export const TeamIdParams = z.object({ id: zIdParam });
export const UpdateTeamBody = z.object({
    name: z.string().trim().min(1),
});
export type TeamIdParamsInput = z.infer<typeof TeamIdParams>;
export type UpdateTeamBodyInput = z.infer<typeof UpdateTeamBody>;
