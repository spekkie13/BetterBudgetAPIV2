import {UserService} from "@/adapters/services/userService";
import {makeUserController} from "@/adapters/controllers/userController";
import {User} from "@/models/user";
import {Team} from "@/models/team";
import {UserWithTeam} from "@/models/userWithTeams";

export async function getUserByToken(token: string | null) : Promise<UserWithTeam> {
    if (!token)
        return UserWithTeam.empty();

    const svc = new UserService();
    const controller = makeUserController(svc);

    let userData = await controller.getUserByToken(token);
    let user: User = User.create(userData.data);
    let team: Team = Team.create(userData.data?.teams[0])

    return new UserWithTeam(user, team);
}
