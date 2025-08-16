import {InferSelectModel, InferInsertModel} from "drizzle-orm";
import {teams as teamTbl} from '@/lib/db/schema'

export type TeamRow = InferSelectModel<typeof teamTbl>
export type TeamInsert = InferInsertModel<typeof teamTbl>

export type TeamKey = { id: number };
export function makeTeamKey(id: number): TeamKey {
    return { id };
}
