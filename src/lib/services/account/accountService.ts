import {makeAccountRepo} from "@/adapters/repo/accountRepo";
import {TeamScopedServiceBase} from "@/lib/services/teamScopedServiceBase";
import {AccountRow} from "@/app/meta/rowModel";
import {AccountInsert} from "@/app/meta/insertModel";
import {AccountPatch} from "@/app/meta/patchModel";

export class AccountService extends TeamScopedServiceBase<
AccountRow,
number,
number,
AccountInsert,
AccountPatch> {
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
