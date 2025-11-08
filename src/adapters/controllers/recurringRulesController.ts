import { Response } from "@/core/http/Response";
import { RecurringRulesService } from "@/adapters/services/recurringRulesService";
import { RecurringRulesInsert, RecurringRulesPatch } from "@/db/types/recurringRulesTypes";

export function makeRecurringRulesController(svc: RecurringRulesService) {
    return {
        async listRules(teamId: number) {
            let items = await svc.selectAllByTeam(teamId);
            return items.length > 0 ?
                new Response({ data: items, status: 200, message: 'request successful' }) :
                new Response({ data: teamId, status: 404, message: 'no rules found' });
        },

        async getRule(teamId: number, id: number | undefined) {
            let row = null;
            if (id === undefined) {
                row = await svc.selectAllByTeam(teamId);
                return row ?
                    new Response({ data: row, status: 200, message: 'request successful' }) :
                    new Response({ data: teamId, status: 404, message: 'Rule not found' });
            }
            row = await svc.selectByIdTeam(teamId, id);
            return row ?
                new Response({ data: row, status: 200, message: 'request successful' }) :
                new Response({ data: teamId, status: 404, message: 'Rule not found' });
        },

        async createRule(teamId: number, body: RecurringRulesInsert) {
            const created = await svc.insert({ ...body, teamId });
            return created ?
                new Response({ data: created, status: 201, message: 'request successful' }) :
                new Response({ data: body, status: 422, message: 'Rule could not be created'})
        },

        async updateRule(teamId: number, id: number, body: RecurringRulesPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ?
                new Response({ data: updated, status: 201, message: 'request successful' }) :
                new Response({ data: body, status: 422, message: 'Rule could not be updated'})
        },

        async deleteRule(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return new Response({ status: 204, data: null, message: 'Rule deleted successfully'});
        },
    };
}
