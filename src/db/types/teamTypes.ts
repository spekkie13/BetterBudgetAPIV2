import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {teams} from "@/db/schema";
import {z} from "zod";
import {zDateTime, zId, zName} from "@/db/types/common";

/** all db Team types */
export type TeamRow = InferSelectModel<typeof teams>;
export type TeamInsert = InferInsertModel<typeof teams>;
export type TeamPatch = Partial<Pick<TeamInsert, 'id' | 'name' | 'createdAt'>>;

export const TeamQuery = z.object({
    id: zId,
    name: zName,
    createdAt: zDateTime,
});
export type TeamQueryInput = z.infer<typeof TeamQuery>;

/** create a composite team key object */
export type TeamKey = { id: number };
export function makeTeamKey(id: number): TeamKey {
    return { id };
}

/** parse route input to verify correctness */
export const TeamParams = z.object({ id: zId });
export type TeamParamsInput = z.infer<typeof TeamParams>;

/** collection query */
export const TeamBody = z.object({
    id: zId,
    name: zName,
    createdAt: zDateTime,
}).refine(
    (val) => ['id', 'name', 'createdAt'].some((k) => Object.prototype.hasOwnProperty.call(val, k)),
    { message: 'No fields to update' }
);
export type TeamBodyInput = z.infer<typeof TeamBody>;
