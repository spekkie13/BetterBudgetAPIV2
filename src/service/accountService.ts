import {AccountInsert, AccountPatch, AccountRow} from "@/db/types/accountTypes";
import {accountRepository} from "@/repository/accountRepo";

export class AccountService {
    async createAccount(data: AccountInsert) : Promise<AccountRow> {
        return await accountRepository.create(data);
    }

    async updateAccount(teamId: number, id: number, data: AccountPatch) : Promise<AccountRow> {
        return await accountRepository.updateById(teamId, id, data);
    }

    async deleteAccount(teamId: number, id: number) : Promise<void> {
        return await accountRepository.deleteById(teamId, id);
    }

    async getAccountById(teamId: number, id: number) : Promise<AccountRow> {
        return await accountRepository.getById(teamId, id);
    }

    async listAccounts(teamId: number, includeArchived: boolean) : Promise<AccountRow[]> {
        return await accountRepository.listByTeam(teamId, includeArchived);
    }
}

export const accountService = new AccountService();
