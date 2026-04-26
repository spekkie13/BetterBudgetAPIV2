import { PeriodInsert, PeriodPatch, PeriodRow } from "@/db/types/periodTypes";
import { IPeriodRepository } from "@/repository/interfaces/IPeriodRepository";
import { periodRepository } from "@/repository/periodRepo";

export class PeriodService {
    constructor(private readonly repo: IPeriodRepository) {}

    async createPeriod(data: PeriodInsert): Promise<PeriodRow> {
        return this.repo.create(data);
    }

    async getPeriodById(teamId: number, id: number): Promise<PeriodRow> {
        return this.repo.getById(teamId, id);
    }

    async getPeriods(teamId: number, status?: string): Promise<PeriodRow[]> {
        if (status) {
            return this.repo.listByStatus(teamId, status);
        }
        return this.repo.listByTeam(teamId);
    }

    async updatePeriod(teamId: number, id: number, data: PeriodPatch): Promise<PeriodRow> {
        return this.repo.updateById(teamId, id, data);
    }

    async deletePeriod(teamId: number, id: number): Promise<void> {
        return this.repo.deleteById(teamId, id);
    }
}

export const periodService = new PeriodService(periodRepository);