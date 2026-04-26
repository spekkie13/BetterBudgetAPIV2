import {ProvisionBodyInput, UserInsert, UserPatch, UserRow, UserWithTeamsRow} from '@/db/types/userTypes';
import { TeamRow } from '@/db/types/teamTypes';

export interface IUserRepository {
    selectByToken(token: string): Promise<UserWithTeamsRow | null>;
    create(user: UserInsert): Promise<UserRow>;
    update(id: number, user: UserPatch): Promise<UserRow>;
    delete(id: number): Promise<void>;
    provision(data: ProvisionBodyInput): Promise<{ userRow: UserRow; teamRow: TeamRow }>;
}
