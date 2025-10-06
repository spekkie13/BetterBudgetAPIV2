import {TeamInsert, TeamPatch, TeamRow} from "@/db/types/teamTypes";
import {makeTeamRepo} from "@/adapters/repo/teamRepo";
import {KeyedRepoServiceBase} from "@/adapters/services/factory/keyedRepoServiceBase";

export class TeamService extends KeyedRepoServiceBase<TeamRow, number, TeamInsert, TeamPatch> {
    constructor() {
        super(makeTeamRepo())
    }
}
