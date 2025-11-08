import { UserService } from '@/adapters/services/userService';
import { UserBodyInput } from "@/db/types/userTypes";
import { Response } from "@/core/http/Response";

export function makeUserController(svc: UserService) {
    return {
        async getUser(id: number) {
            const user = await svc.selectById(id);
            return user ?
                new Response({data: user, status: 200, message: 'successfully fetched user'}) :
                new Response({data: null, status: 404, message: 'No user found'});
        },

        async createUser(body: UserBodyInput) {
            const created = await svc.createUser({ ...body });
            return created ?
                new Response({data: created, status: 201, message: 'successfully created user'}) :
                new Response({data: null, status: 400, message: 'No user created'});
        },

        async updateUser(id: number, body: UserBodyInput) {
            const updated = await svc.updateById(id, body);
            return updated ?
                new Response({data: updated, status: 201, message: 'successfully updated user'}) :
                new Response({data: null, status: 400, message: 'No user updated'});
        },

        async deleteUser(id: number) {
            await svc.deleteById(id);
            return new Response({
                data: null,
                status: 204,
                message: 'successfully deleted user'
            })
        },

        async getUserByToken(token: string) {
            const users = await svc.selectByToken(token);
            return users ?
                new Response({data: users, status: 200, message: 'successfully fetched users'}) :
                new Response({data: null, status: 404, message: 'No users found'});
        },
    }
}
