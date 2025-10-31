import { z } from 'zod';
import {zEmail, zId, zName, zTeamId} from "@/db/types/common";
import {InferSelectModel} from "drizzle-orm";
import {users} from "@/db/schema";

/** all db Transaction types */
export type UserRow = InferSelectModel<typeof users>;
export type UserInsert = InferSelectModel<typeof users>;
export type UserPatch = Partial<Pick<UserInsert, 'email' | 'username' | 'name'>>;

export const UserQuery = z.object({
    userId: zId,
    teamId: zTeamId,
    email: zEmail,
})
export type UserQueryInput = z.infer<typeof UserQuery>;

/** Parse route input to verify correctness */
export const UserParams = z.object({ teamId: zTeamId, id: zId });
export type UserParamsInput = z.infer<typeof UserParams>;

/** Collection query */
export const UserBody = z.object({
    id: zId,
    supabaseUid: z.string().trim().min(1),
    teamId: zTeamId,
    email: zEmail,
    username: z.string().trim().min(1),
    name: zName,
}).refine(
    (val) =>
        ['teamId', 'email', 'username', 'name'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
);
export type UserBodyInput = z.infer<typeof UserBody>;
