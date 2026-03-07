import { UserInsert, UserPatch, UserRow, UserWithTeamsRow } from '@/db/types/userTypes';

export interface IUserRepository {
    selectByToken(token: string): Promise<UserWithTeamsRow | null>;
    create(user: UserInsert): Promise<UserRow>;
    update(id: number, user: UserPatch): Promise<UserRow>;
    delete(id: number): Promise<void>;
}
