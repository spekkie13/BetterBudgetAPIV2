import { NotFoundForTeamError } from "@/models/errors/base";

export class ResultNotFoundForTeamError extends NotFoundForTeamError {
    constructor(teamId: number) {
        super('Result', teamId);
    }
}