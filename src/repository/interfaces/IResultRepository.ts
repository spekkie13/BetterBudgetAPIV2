import { ResultInsert, ResultPatch, ResultRow } from "@/db/types/resultTypes";

export interface IResultRepository {
    upsert(data: ResultInsert): Promise<ResultRow>;
    getById(teamId: number, id: number): Promise<ResultRow>;
    listByPeriod(teamId: number, periodId: number): Promise<ResultRow[]>;
    getByPeriodAndCategory(teamId: number, periodId: number, categoryId: number): Promise<ResultRow>;
    updateById(teamId: number, id: number, data: ResultPatch): Promise<ResultRow>;
    deleteById(teamId: number, id: number): Promise<void>;
}