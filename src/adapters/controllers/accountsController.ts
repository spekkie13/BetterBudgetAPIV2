import {AccountService} from "@/adapters/services/accountService";
import {ok, fail} from "@/core/http/Response";
import {AccountInsert, AccountPatch, AccountQueryInput} from "@/db/types/accountTypes";

export function makeAccountsController(svc: AccountService) {
    return {
        async listAccounts(teamId: number, query: AccountQueryInput) {
            const items = await svc.selectAllByTeam(teamId);
            const filtered = query?.includeArchived ? items : items.filter(a => !a.isArchived);
            return ok(filtered);
        },

        async getAccount(teamId: number, id: number) {
            const row = await svc.selectByIdTeam(teamId, id);
            return row ? ok(row) : fail(404, "Account not found");
        },

        async createAccount(teamId: number, body: AccountInsert) {
            const created = await svc.insert({ ...body, teamId });
            return ok(created, 'Account created successfully',201);
        },

        async updateAccount(teamId: number, id: number, body: AccountPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ? ok(updated) : fail(404, "Account not found");
        },

        async deleteAccount(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return ok(null, 'account deleted successfully',204);
        },
    };
}
