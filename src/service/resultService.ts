import { ResultInsert, ResultPatch, ResultRow } from "@/db/types/resultTypes";
import { IResultRepository } from "@/repository/interfaces/IResultRepository";
import { resultRepository } from "@/repository/resultRepo";

export class ResultService {
    constructor(private readonly repo: IResultRepository) {}

    async upsertResult(data: ResultInsert): Promise<ResultRow> {
        return this.repo.upsert(data);
    }

    async getResultById(teamId: number, id: number): Promise<ResultRow> {
        return this.repo.getById(teamId, id);
    }

    async getResults(teamId: number, periodId: number, categoryId?: number): Promise<ResultRow | ResultRow[]> {
        if (categoryId) {
            return this.repo.getByPeriodAndCategory(teamId, periodId, categoryId);
        }
        return this.repo.listByPeriod(teamId, periodId);
    }

    async updateResult(teamId: number, id: number, data: ResultPatch): Promise<ResultRow> {
        return this.repo.updateById(teamId, id, data);
    }

    async deleteResult(teamId: number, id: number): Promise<void> {
        return this.repo.deleteById(teamId, id);
    }
}

export const resultService = new ResultService(resultRepository);