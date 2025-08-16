import { UsersQueryInput, CreateUserInput } from './userSchemas';
import { deleteUserById, updateUser, createUser, getUserByEmail, getUserById, getUsers, getUsersByTeamId } from '@/lib/services/user/userService';
import { UpdateUserInput, UserIdParamsInput } from './userSchemas';

export async function listOrFilterUsersController(q: UsersQueryInput) {
    // GET by userId
    if (q.userId !== undefined) {
        const user = await getUserById(Number(q.userId));
        return user ? { status: 200, body: user } : { status: 404, body: { error: `No user with id ${q.userId}` } };
    }
    // GET by teamId
    if (q.teamId !== undefined) {
        const users = await getUsersByTeamId(Number(q.teamId));
        return { status: 200, body: users ?? [] };
    }
    // GET by email
    if (q.email) {
        const user = await getUserByEmail(q.email);
        return user ? { status: 200, body: user } : { status: 404, body: { error: `No user with email ${q.email}` } };
    }
    // GET all
    const all = await getUsers();
    return { status: 200, body: all ?? [] };
}

export async function createUserController(body: CreateUserInput) {
    const created = await createUser({ email: body.email, username: body.username, name: body.name });
    return { status: 201, body: created };
}

export async function getUserByIdController(params: UserIdParamsInput) {
    const user = await getUserById(params.id);
    return user ? { status: 200, body: user } : { status: 404, body: { error: 'user not found' } };
}

export async function updateUserController(params: UserIdParamsInput, body: UpdateUserInput) {
    const updated = await updateUser({ id: params.id, ...body });
    return { status: 200, body: updated };
}

export async function deleteUserController(params: UserIdParamsInput) {
    await deleteUserById(params.id);
    return { status: 204, body: null };
}
