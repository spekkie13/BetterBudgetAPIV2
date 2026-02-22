import { z } from 'zod';
import {zDateTime, zEmail, zId, zName, zTeamId} from "@/db/types/common";
import {InferSelectModel} from "drizzle-orm";
import {users} from "@/db/schema";

/** all db Transaction types */
export type UserRow = InferSelectModel<typeof users>;
export type UserInsert = InferSelectModel<typeof users>;
export type UserPatch = Partial<Pick<UserInsert, 'email' | 'username' | 'name'>>;

export const UserQuery = z.object({
    userId: zId,
    token: z.string().trim().min(1).optional().nullable(),
    teamId: zTeamId,
    email: zEmail,
})
export type UserQueryInput = z.infer<typeof UserQuery>;

/** Parse route input to verify correctness */
export const UserParams = z.object({ id: zId });
export type UserParamsInput = z.infer<typeof UserParams>;

/** Collection query */
export const UserBody = z.object({
    id: zId,
    email: zEmail,
    name: zName,
    supabaseUid: z.string().trim().min(1),
    username: z.string().trim().min(1),
    createdAt: zDateTime
})
export type UserBodyInput = z.infer<typeof UserBody>;
