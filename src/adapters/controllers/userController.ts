import { UserService } from '@/adapters/services/userService';
import {UserBodyInput, UserQueryInput} from "@/db/types/userTypes";

export function makeUserController(svc: UserService) {
    return {
        async listUsers(query: UserQueryInput) {
            const items = await svc.listAll();
            return { status: 200, body: items };
        },

        async getUser(id: number) {
            const user = await svc.selectById(id);
            return user ? { status: 200, body: user } : { status: 404, body: { error: 'user not found' } };
        },

        async createUser(body: UserBodyInput) {
            const created = await svc.createUser({ email: body.email, username: body.username, name: body.name });
            return { status: 201, body: created };
        },

        async updateUser(id: number, body: UserBodyInput) {
            const updated = await svc.updateById(id, body);
            return updated ? { status: 200, body: updated } : { status: 404, body: { error: 'user not found' } };
        },

        async deleteUser(id: number) {
            await svc.deleteById(id);
            return { status: 204, body: null };
        },

        async getUserByEmail(email: string) {
            const user = await svc.selectByEmail(email);
            return user ? { status: 200, body: user } : { status: 404, body: { error: 'user not found' } };
        },

        async getUserByTeamId(teamId: number) {
            const user = await svc.selectByTeamId(teamId);
            return user ? { status: 200, body: user } : { status: 404, body: { error: 'user not found' } };
        }
    }
}
