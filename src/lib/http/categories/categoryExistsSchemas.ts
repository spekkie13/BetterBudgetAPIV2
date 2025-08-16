import { z } from 'zod';
import { zTeamId } from '@/lib/http/shared/schemas';

export const CheckCategoryExistsBody = z.object({
    teamId: zTeamId,
    name: z.string().trim().min(1, 'name is required'),
}).strict();

export type CheckCategoryExistsInput = z.infer<typeof CheckCategoryExistsBody>;
