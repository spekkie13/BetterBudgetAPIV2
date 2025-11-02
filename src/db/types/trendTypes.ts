import { z } from 'zod';
import {zMonths} from "@/db/types/common";

export const SpendTrendQuery = z.object({ months: zMonths });
export type SpendTrendQueryInput = z.infer<typeof SpendTrendQuery>;
