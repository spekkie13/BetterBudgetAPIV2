import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { accounts } from '@/lib/db/schema';

export type AccountRow = InferSelectModel<typeof accounts>;
export type AccountInsert = InferInsertModel<typeof accounts>;

// What callers are allowed to patch
export type AccountPatch = Partial<Pick<AccountInsert, 'name' | 'type' | 'currency' | 'isArchived'>>;
