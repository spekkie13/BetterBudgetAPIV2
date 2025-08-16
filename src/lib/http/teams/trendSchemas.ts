import { z } from 'zod';
import { zTeamIdParam, zMonths } from './commonSchemas';

export const SpendTrendParams = z.object({ teamId: zTeamIdParam });
export const SpendTrendQuery = z.object({ months: zMonths });

export type SpendTrendParamsInput = z.infer<typeof SpendTrendParams>;
export type SpendTrendQueryInput = z.infer<typeof SpendTrendQuery>;
