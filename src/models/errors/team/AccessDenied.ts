import {ForbiddenError} from "@/models/errors/base";

export class TeamAccessDeniedError extends ForbiddenError {
    constructor(teamId: number) {
        super(`You don't have access to team ${teamId}`);
    }
}
