import {TeamInsert, TeamPatch, TeamRow} from "@/db/types/teamTypes";
import {teamRepository} from "@/repository/teamRepo";
import {ITeamRepository} from "@/repository/interfaces/ITeamRepository";

export class TeamService {
    constructor(private readonly repo: ITeamRepository) {}

    async getTeamById(id: number): Promise<TeamRow> {
        return await this.repo.getById(id);
    }

    async createTeam(team: TeamInsert) : Promise<TeamRow> {
        return await this.repo.create(team);
    }

    async updateTeam(teamId: number, team: TeamPatch): Promise<TeamRow> {
        return await this.repo.updateById(teamId, team);
    }

    async deleteTeam(teamId: number): Promise<void> {
        await this.repo.deleteById(teamId);
    }

    async listAll(): Promise<TeamRow[]> {
        return await this.repo.selectAll();
    }
}

export const teamService = new TeamService(teamRepository);
