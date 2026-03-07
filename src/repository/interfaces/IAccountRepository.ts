import { AccountInsert, AccountPatch, AccountRow } from '@/db/types/accountTypes';

export interface IAccountRepository {
    create(data: AccountInsert): Promise<AccountRow>;
    getById(teamId: number, id: number): Promise<AccountRow>;
    listByTeam(teamId: number, includeArchived: boolean): Promise<AccountRow[]>;
    updateById(teamId: number, id: number, data: AccountPatch): Promise<AccountRow>;
    deleteById(teamId: number, id: number): Promise<void>;
    exists(teamId: number, id: number): Promise<boolean>;
}
