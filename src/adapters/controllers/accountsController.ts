import { AccountService } from "@/adapters/services/accountService";
import { AccountInsert, AccountPatch } from "@/db/types/accountTypes";
import { Response } from "@/core/http/Response";

export function makeAccountsController(svc: AccountService) {
    return {
        async listAccounts(teamId: number, includeArchived: boolean | undefined) {
            let items = await svc.selectAllByTeam(teamId);
            if (includeArchived) {
                items = items.filter(a => !a.isArchived);
            }
            return items.length > 0 ?
                new Response({ data: items, status: 200, message: 'request successful' }) :
                new Response({ data: teamId, status: 404, message: 'no accounts found' });
        },

        async getAccount(teamId: number, id: number | undefined) {
            let row = null;
            if (id === undefined) {
                row = await svc.selectAllByTeam(teamId);
                return row ?
                    new Response({ data: row, status: 200, message: 'request successful' }) :
                    new Response({ data: teamId, status: 404, message: 'Account not found' });
            }
            row = await svc.selectByIdTeam(teamId, id);
            return row ?
                new Response({ data: row, status: 200, message: 'request successful' }) :
                new Response({ data: teamId, status: 404, message: 'Account not found' });
        },

        async createAccount(teamId: number, body: AccountInsert) {
            const created = await svc.insert({ ...body, teamId });
            return created ?
                new Response({ data: created, status: 201, message: 'request successful' }) :
                new Response({ data: body, status: 422, message: 'Account could not be created'})
        },

        async updateAccount(teamId: number, id: number, body: AccountPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ?
                new Response({ data: updated, status: 201, message: 'request successful' }) :
                new Response({ data: body, status: 422, message: 'Account could not be updated'})
        },

        async deleteAccount(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return new Response({ status: 204, data: null, message: 'account deleted successfully'});
        },
    };
}
