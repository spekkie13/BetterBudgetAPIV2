import { UserService } from '@/adapters/services/userService';
import { UserBodyInput } from "@/db/types/userTypes";
import { ApiDataResponse } from "@/core/http/ApiDataResponse";

export function makeUserController(svc: UserService) {
    return {
        // async listUsers(query: UserQueryInput) {
        //     const items = await svc.listAll();
        //     return items ?
        //         new ApiDataResponse({data: items, status: 200, message: 'successfully listed users'}) :
        //         new ApiDataResponse({data: null, status: 404, message: 'No users found'});
        // },

        async getUser(id: number) {
            const user = await svc.selectById(id);
            return user ?
                new ApiDataResponse({data: user, status: 200, message: 'successfully fetched user'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No user found'});
        },

        async createUser(body: UserBodyInput) {
            const created = await svc.createUser({ ...body });
            return created ?
                new ApiDataResponse({data: created, status: 201, message: 'successfully created user'}) :
                new ApiDataResponse({data: null, status: 400, message: 'No user created'});
        },

        async updateUser(id: number, body: UserBodyInput) {
            const updated = await svc.updateById(id, body);
            return updated ?
                new ApiDataResponse({data: updated, status: 201, message: 'successfully updated user'}) :
                new ApiDataResponse({data: null, status: 400, message: 'No user updated'});
        },

        async deleteUser(id: number) {
            await svc.deleteById(id);
            return new ApiDataResponse({
                data: null,
                status: 204,
                message: 'successfully deleted user'
            })
        },

        async getUserByEmail(email: string) {
            const user = await svc.selectByEmail(email);
            return user ?
                new ApiDataResponse({data: user, status: 200, message: 'successfully fetched user'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No user found'});
        },

        async getUserByTeamId(teamId: number) {
            const users = await svc.selectByTeamId(teamId);
            return users ?
                new ApiDataResponse({data: users, status: 200, message: 'successfully fetched users'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No users found'});
        }
    }
}
