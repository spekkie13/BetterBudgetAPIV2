import { Team, User } from "@/models";

export class UserWithTeam {
    user: User;
    team: Team;

    constructor(user: User, team: Team) {
        this.user = user;
        this.team = team;
    }

    static empty() {
        return new UserWithTeam(
            User.empty(),
            Team.empty()
        )
    }
}
