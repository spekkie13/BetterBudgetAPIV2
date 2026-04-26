import { PeriodInsert, PeriodPatch, PeriodRow } from "@/db/types/periodTypes";

export interface IPeriodRepository {
    create(data: PeriodInsert): Promise<PeriodRow>;
    getById(teamId: number, id: number): Promise<PeriodRow>;
    listByTeam(teamId: number): Promise<PeriodRow[]>;
    listByStatus(teamId: number, status: string): Promise<PeriodRow[]>;
    updateById(teamId: number, id: number, data: PeriodPatch): Promise<PeriodRow>;
    deleteById(teamId: number, id: number): Promise<void>;
}