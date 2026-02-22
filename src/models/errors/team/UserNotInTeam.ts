import {ForbiddenError} from "@/models/errors/base";

export class UserNotInTeamError extends ForbiddenError {
    constructor(userId: number, teamId: number) {
        super(`User ${userId} is not a member of team ${teamId}`);
    }
}
