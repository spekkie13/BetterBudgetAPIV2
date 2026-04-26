import { NotFoundForTeamError } from "@/models/errors/base";

export class PeriodNotFoundForTeamError extends NotFoundForTeamError {
    constructor(teamId: number) {
        super('Period', teamId);
    }
}