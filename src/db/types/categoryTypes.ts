import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {categories} from "@/db/schema";
import { z } from 'zod';
import {zId, zName, zTeamId, zType50, zUserId} from "@/db/types/common";

/**all db Category types*/
export type CategoryRow = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;
export type CategoryPatch = Partial<Pick<CategoryInsert, 'name' | 'type' | 'color' | 'icon' | 'parentId'>>;

export const CategoryQuery = z.object({
    id: z.number().int(),
    teamId: z.number().int(),
    type: z.string(),
})

/** create a composite category key object */

/** Parse route input to verify correctness */
export const CategoryParams = z.object({ teamId: zTeamId, id: zId });
export type CategoryParamsInput = z.infer<typeof CategoryParams>;

/** Collection query */
export const CategoryBody = z.object({
    id: zId,
    teamId: zTeamId,
    name: zName,
    type: zType50,
    color: z.string().trim().min(1).optional(),
    icon: z.string().trim().min(1).optional(),
    parentId: z.number().int().optional(),
}).refine(
    (val) =>
        ['teamId', 'name', 'type', 'color', 'icon', 'parentId'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
    { message: 'No fields to update' }
)

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
