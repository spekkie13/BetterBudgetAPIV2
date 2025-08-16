// lib/domain/budget.ts
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { memberships as membershipTbl} from '@/lib/db/schema';

export type MembershipRow = InferSelectModel<typeof membershipTbl>;
export type MembershipInsert = InferInsertModel<typeof membershipTbl>;

/** Unique key shape for a budget row */
export type MembershipKey = { userId: number; teamId: number };
export function makeMembershipKey(userId: number, teamId: number): MembershipKey {
    return { userId, teamId };
}
