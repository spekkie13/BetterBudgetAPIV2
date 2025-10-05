import {InferSelectModel} from "drizzle-orm";
import {userSettings} from "@/db/schema";
import {z} from "zod";
import {zUserId} from "@/db/types/common";

/** all db User Settings types */
export type UserSettingsRow = InferSelectModel<typeof userSettings>;
export type UserSettingsInsert = InferSelectModel<typeof userSettings>;
export type UserSettingsPatch = Partial<Pick<UserSettingsInsert, 'theme' | 'textSize' | 'preferences'>>;

export const UserSettingsQuery = z.object({
    userId: zUserId,
    theme: z.string().trim().min(1).optional(),
    textSize: z.string().trim().min(1).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
});
export type UserSettingsQueryInput = z.infer<typeof UserSettingsQuery>;

/** Parse route input to verify correctness */
export const UserSettingsParams = z.object({ userId: zUserId });

/** Collection query (?includeArchived=true|false) */
export const UserSettingsBody = z.object({
    userId: zUserId,
    theme: z.string().trim().min(1),
    textSize: z.string().trim().min(1),
    preferences: z.record(z.string(), z.any()),
}).refine(
    (val) =>
        ['userId', 'theme', 'textSize', 'preferences'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
    { message: 'No fields to update' }
)
export type UserSettingsBodyInput = z.infer<typeof UserSettingsBody>;

export type CategorySlotPref = { name: string; numberValue: number | null };
