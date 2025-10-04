import { z } from 'zod';
import {zId, zTeamId} from '@/lib/http/shared/schemas';

export const CheckCategoryExistsBody = z.object({
    teamId: zTeamId,
    id: zId,
}).strict();

export type CheckCategoryExistsInput = z.infer<typeof CheckCategoryExistsBody>;
