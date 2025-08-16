import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import { categories as categoryTbl } from '@/lib/db/schema'

/** Persisted row (DB shape) */
export type CategoryRow = InferSelectModel<typeof categoryTbl>;
/** Insertable patch (DB shape) */
export type CategoryInsert = InferInsertModel<typeof categoryTbl>;

/** Unique key shape for a budget row */

export type CategoryKey = { id: number };
export function makeCategoryKey(id: number): CategoryKey {
    return { id };
}
