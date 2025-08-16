import { z } from 'zod';

const zUserId = z.union([z.number().int(), z.string()])
    .transform(Number)
    .refine(Number.isInteger, 'Invalid userId');

export const GetSettingsQuery = z.object({
    userId: zUserId,
    preferenceName: z.string().trim().min(1).optional(),
});
export type GetSettingsQueryInput = z.infer<typeof GetSettingsQuery>;

export const UpsertSettingsBody = z.object({
    userId: zUserId,
    theme: z.union([z.literal('light'), z.literal('dark'), z.literal('system')]).optional().nullable(),
    textSize: z.union([z.literal('S'), z.literal('M'), z.literal('L'), z.literal('XL')]).optional().nullable(),
    preferences: z.record(z.string(), z.any()).optional().nullable(),
});
export type UpsertSettingsInput = z.infer<typeof UpsertSettingsBody>;

export const SetPreferenceBody = z.object({
    userId: zUserId,
    name: z.string().trim().min(1),
    value: z.any(),
});
export type SetPreferenceInput = z.infer<typeof SetPreferenceBody>;

export const PatchSettingsBody = z.object({
    userId: zUserId,
    theme: z.union([z.literal('light'), z.literal('dark'), z.literal('system')]).optional().nullable(),
    textSize: z.union([z.literal('S'), z.literal('M'), z.literal('L'), z.literal('XL')]).optional().nullable(),
    preferences: z.record(z.string(), z.any()).optional().nullable(),
}).refine(obj => Object.keys(obj).some(k => k !== 'userId'), {
    message: 'No fields to patch',
});
export type PatchSettingsInput = z.infer<typeof PatchSettingsBody>;

export const DeleteSettingsQuery = z.object({
    userId: zUserId,
});
export type DeleteSettingsQueryInput = z.infer<typeof DeleteSettingsQuery>;

// Specialized: category slots
export const CategorySlotsBody = z.object({
    userId: zUserId,
    preferences: z.array(
        z.object({
            name: z.string().trim().min(1),
            numberValue: z.number().int().nullable(),
        })
    ),
});
export type CategorySlotsInput = z.infer<typeof CategorySlotsBody>;
