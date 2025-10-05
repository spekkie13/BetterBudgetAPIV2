import {makeAccountRepo} from "@/adapters/repo/accountRepo";
import {TeamScopedServiceBase} from "@/adapters/services/factory/teamScopedServiceBase";
import {AccountRow, AccountInsert, AccountPatch} from "@/db/types/accountTypes";

export class AccountService extends TeamScopedServiceBase<AccountRow, number, number, AccountInsert, AccountPatch> {
    constructor() {
        super(makeAccountRepo())
    }

    async getCurrency(teamId: number, accountId: number) {
        const acc = await this.selectByIdTeam(teamId, accountId);
        if (acc) {
            return acc.currency;
        }
    }
}
