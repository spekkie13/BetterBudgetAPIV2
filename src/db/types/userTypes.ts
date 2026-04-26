import { z } from 'zod';
import {zDateTime, zEmail, zId, zName, zTeamId} from "@/db/types/common";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {users} from "@/db/schema";

/** all db User types */
export type UserRow = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type UserPatch = Partial<Pick<UserInsert, 'email' | 'username' | 'name'>>;

export interface UserWithTeamsRow {
    id: number;
    token: string;
    email: string;
    username: string;
    name: string;
    createdAt: Date;
    teams: { id: number; name: string }[];
}

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

export const ProvisionBody = z.object({
    supabaseUid: z.string().trim().min(1),
    email: zEmail,
    username: z.string().trim().min(1),
    name: zName,
});
export type ProvisionBodyInput = z.infer<typeof ProvisionBody>;
