import { TransactionService } from "@/adapters/services/transactionService";
import { TransactionPatch } from "@/db/types/transactionTypes";
import { ApiDataResponse } from "@/core/http/ApiDataResponse";

export function makeTransactionController(svc: TransactionService) {
    return {
        async listAllByTeam(teamId: number) {
            const rows = await svc.selectAllByTeam(teamId);
            return rows ?
                new ApiDataResponse({ data: rows, status: 200, message: 'fetched all rows'}) :
                new ApiDataResponse({ data: null, status: 404, message: 'No transactions found' });
        },

        async getTransaction(teamId: number, id: number) {
            const row = await svc.selectByIdTeam(teamId, id);
            return row ?
                new ApiDataResponse({ data: row, status: 200, message: 'Successfully retrieved transaction'}) :
                new ApiDataResponse({ data: null, status: 404, message: 'No transaction found' });
        },

        async createTransaction(teamId: number, body: any) {
            const created = await svc.insert({ ...body, teamId });
            return created ?
                new ApiDataResponse({ data: created, status: 201, message: 'created new transaction'}) :
                new ApiDataResponse({ data: null, status: 400, message: 'No transactions created' });
        },

        async updateTransaction(teamId: number, id: number, body: TransactionPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ?
                new ApiDataResponse({ data: updated, status: 201, message: 'created new transaction'}) :
                new ApiDataResponse({ data: null, status: 400, message: 'No transactions updated' });
        },

        async deleteTransaction(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return new ApiDataResponse({ data: null, status: 204, message: 'deleted transaction'});
        },

        async selectTransactionsByType(teamId: number, type: string | null) {
            const result = await svc.selectByType(teamId, type);
            return result ?
                new ApiDataResponse({ data: result, status: 200, message: 'Successfully retrieved transactions' }) :
                new ApiDataResponse({ data: null, status: 404, message: 'No transactions found' });
        }
    }
}
