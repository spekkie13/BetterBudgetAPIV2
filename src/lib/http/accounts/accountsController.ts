import {AccountService} from "@/lib/services/account/accountService";
import {ok, fail} from "@/lib/utils/apiResponse";
import {AccountsQueryInput} from "@/lib/http/accounts/accountSchemas";
import {CreateAccountInput} from "@/db/types/accountTypes";
import {AccountInsert} from "@/app/meta/insertModel";

export function makeAccountsController(svc: AccountService) {
    return {
        async listAccounts(teamId: number, query: AccountsQueryInput) {
            const items = await svc.selectAllByTeam(teamId);
            const filtered = query?.includeArchived ? items : items.filter(a => !a.isArchived);
            return ok(filtered);
        },

        async getAccount(teamId: number, id: number) {
            const row = await svc.selectByIdTeam(teamId, id);            // ✅ don't scan the whole table
            return row ? ok(row) : fail(404, "Account not found");
        },

        async createAccount(teamId: number, body: CreateAccountInput) {
            const created = await svc.insert({ ...body, teamId });        // ✅ add teamId, and await
            return ok(created, 'Account created successfully',201);
        },

        async updateAccount(teamId: number, id: number, body: AccountInsert) {
            const updated = await svc.updateByIdTeam(teamId, id, body);   // ✅ pass patch directly
            return updated ? ok(updated) : fail(404, "Account not found");
        },

        async deleteAccount(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return ok(null, 'account deleted succssfully',204);
        },
    };
}
