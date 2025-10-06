import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {memberships} from "@/db/schema";
import {z} from "zod";
import {zId, zTeamId} from "@/db/types/common";

/** all db Membership types */
export type MembershipRow = InferSelectModel<typeof memberships>;
export type MembershipInsert = InferInsertModel<typeof memberships>;
export type MembershipPatch = Partial<Pick<MembershipInsert, 'userId' | 'teamId' | 'role' | 'joinedAt'>>;

/** create a composite membership key object */
export type MembershipKey = { userId: number; teamId: number };
export function makeMembershipKey(userId: number, teamId: number): MembershipKey {
    return { userId, teamId };
}

/** Parse route input to verify correctness */
export const MembershipParams = z.object({ teamId: zTeamId, userId: zId });
export type MembershipParamsInput = z.infer<typeof MembershipParams>;

/** Collection query */
export const MembershipBody = z.object({
    teamId: zTeamId,
    userId: zId,
    role: z.string().optional(),
    joinedAt: z.string().datetime().optional(),
}).refine(
    (val) =>
        ['teamId', 'userId', 'role', 'joinedAt'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
)
