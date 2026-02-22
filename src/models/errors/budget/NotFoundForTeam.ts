import { NotFoundForTeamError } from "@/models/errors/base";

export class BudgetNotFoundForTeamError extends NotFoundForTeamError {
    constructor(teamId: number) {
        super('Budget', teamId);
    }
}
