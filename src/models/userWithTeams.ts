import { Team, User } from "@/models";

export class UserWithTeam {
    user: User;
    teams: Team | Team[];

    constructor(user: User, teams: Team | Team[]) {
        this.user = user;
        this.teams = Array.isArray(teams) ? teams : [teams];
    }

    get team(): Team {
        if (Array.isArray(this.teams)) {
            return this.teams[0];
        }
        return this.teams;
    }

    static empty() {
        return new UserWithTeam(
            User.empty(),
            [Team.empty()]
        )
    }
}
