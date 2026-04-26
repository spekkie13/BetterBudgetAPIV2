import {userRepository} from "@/repository/userRepo";
import {UserInsert, UserPatch, UserRow, UserWithTeamsRow, ProvisionBodyInput} from "@/db/types/userTypes";
import {IUserRepository} from "@/repository/interfaces/IUserRepository";
import {User, Team, UserWithTeam} from "@/models";

export class UserService {
    constructor(private readonly repo: IUserRepository) {}

    async getUserByToken(token: string): Promise<UserWithTeamsRow | null> {
        return await this.repo.selectByToken(token);
    }

    async createUser(user: UserInsert) : Promise<UserRow> {
        return await this.repo.create(user);
    }

    async updateUser(id: number, user: UserPatch) : Promise<UserRow> {
        return await this.repo.update(id, user);
    }

    async deleteUser(id: number) : Promise<void> {
        await this.repo.delete(id);
    }

    async provisionFromSupabase(data: ProvisionBodyInput): Promise<UserWithTeam> {
        const { userRow, teamRow } = await this.repo.provision(data);
        const user: User = User.create({
            id: userRow.id,
            token: userRow.supabaseUid,
            email: userRow.email,
            username: userRow.username,
            name: userRow.name,
            createdAt: userRow.createdAt,
        });
        const team: Team = Team.create(teamRow);
        return new UserWithTeam(user, team);
    }
}

export const userService = new UserService(userRepository);
