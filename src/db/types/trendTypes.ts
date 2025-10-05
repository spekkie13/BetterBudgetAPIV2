import { z } from 'zod';
import {zMonths, zTeamId} from "@/db/types/common";

export const SpendTrendParams = z.object({ teamId: zTeamId });
export const SpendTrendQuery = z.object({ months: zMonths });

export type SpendTrendParamsInput = z.infer<typeof SpendTrendParams>;
export type SpendTrendQueryInput = z.infer<typeof SpendTrendQuery>;
