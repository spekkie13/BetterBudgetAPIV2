import {AccountInsert, AccountPatch, AccountRow} from "@/db/types/accountTypes";
import {accountRepository} from "@/repository/accountRepo";
import {IAccountRepository} from "@/repository/interfaces/IAccountRepository";

export class AccountService {
    constructor(private readonly repo: IAccountRepository) {}

    async createAccount(data: AccountInsert) : Promise<AccountRow> {
        return await this.repo.create(data);
    }

    async updateAccount(teamId: number, id: number, data: AccountPatch) : Promise<AccountRow> {
        return await this.repo.updateById(teamId, id, data);
    }

    async deleteAccount(teamId: number, id: number) : Promise<void> {
        return await this.repo.deleteById(teamId, id);
    }

    async getAccountById(teamId: number, id: number) : Promise<AccountRow> {
        return await this.repo.getById(teamId, id);
    }

    async listAccounts(teamId: number, includeArchived: boolean) : Promise<AccountRow[]> {
        return await this.repo.listByTeam(teamId, includeArchived);
    }
}

export const accountService = new AccountService(accountRepository);
