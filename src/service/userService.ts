import {userRepository} from "@/repository/userRepo";
import {UserInsert, UserPatch, UserRow, UserWithTeamsRow} from "@/db/types/userTypes";
import {IUserRepository} from "@/repository/interfaces/IUserRepository";

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
}

export const userService = new UserService(userRepository);
