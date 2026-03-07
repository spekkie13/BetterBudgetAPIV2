import { TeamInsert, TeamPatch, TeamRow } from '@/db/types/teamTypes';

export interface ITeamRepository {
    create(data: TeamInsert): Promise<TeamRow>;
    getById(id: number): Promise<TeamRow>;
    updateById(id: number, data: TeamPatch): Promise<TeamRow>;
    deleteById(id: number): Promise<void>;
    selectAll(): Promise<TeamRow[]>;
}
