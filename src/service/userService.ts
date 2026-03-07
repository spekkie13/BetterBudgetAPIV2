import {userRepository} from "@/repository/userRepo";
import {UserInsert, UserPatch, UserRow, UserWithTeamsRow} from "@/db/types/userTypes";

export class UserService {
    async getUserByToken(token: string): Promise<UserWithTeamsRow | null> {
        return await userRepository.selectByToken(token);
    }

    async createUser(user: UserInsert) : Promise<UserRow> {
        return await userRepository.create(user);
    }

    async updateUser(id: number, user: UserPatch) : Promise<UserRow> {
        return await userRepository.update(id, user);
    }

    async deleteUser(id: number) : Promise<void> {
        await userRepository.delete(id);
    }
}

export const userService = new UserService();
