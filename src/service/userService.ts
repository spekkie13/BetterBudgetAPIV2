import {userRepository} from "@/repository/userRepo";
import {UserRow} from "@/db/types/userTypes";

export class UserService {
    async getUserByToken(token: string) {
        return await userRepository.selectByToken(token);
    }

    async createUser(user: UserRow) : Promise<UserRow> {
        return await userRepository.create(user);
    }

    async updateUser(id: number, user: UserRow) : Promise<UserRow> {
        return await userRepository.update(id, user);
    }

    async deleteUser(id: number) : Promise<void> {
        await userRepository.delete(id);
    }
}

export const userService = new UserService();
