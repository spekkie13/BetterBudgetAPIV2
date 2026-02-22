import {TeamInsert, TeamPatch, TeamRow} from "@/db/types/teamTypes";
import {teamRepository} from "@/repository/teamRepo";

export class TeamService {
    async getTeamById(id: number): Promise<TeamRow> {
        return await teamRepository.getById(id);
    }

    async createTeam(team: TeamInsert) : Promise<TeamRow> {
        return await teamRepository.create(team);
    }

    async updateTeam(teamId: number, team: TeamPatch): Promise<TeamRow> {
        return await teamRepository.updateById(teamId, team);
    }

    async deleteTeam(teamId: number): Promise<void> {
        await teamRepository.deleteById(teamId);
    }

    async listAll(): Promise<TeamRow[]> {
        return await teamRepository.selectAll();
    }
}

export const teamService = new TeamService();
