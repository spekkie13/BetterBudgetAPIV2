import {TransactionService} from "@/adapters/services/transactionService";
import {TransactionInsert, TransactionPatch} from "@/db/types/transactionTypes";

export function makeTransactionController(svc: TransactionService) {
    return {
        async listAllByTeam(teamId: number) {
            const rows = await svc.selectAllByTeam(teamId);
            return { status: 200, body: rows };
        },

        async getTransaction(teamId: number, id: number) {
            const row = await svc.selectByIdTeam(teamId, id);
            return row ? { status: 200, body: row } : { status: 404, body: { error: 'Transaction not found' } };
        },

        async createTransaction(teamId: number, body: TransactionInsert) {
            const created = await svc.insert({ ...body, teamId });
            return { status: 201, body: created, message: 'Transaction created successfully' };
        },

        async updateTransaction(teamId: number, id: number, body: TransactionPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ? { status: 200, body: updated } : { status: 404, body: { error: 'Transaction not found' } };
        },

        async deleteTransaction(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return { status: 204, body: null, message: 'Transaction deleted successfully' };
        },
    }
}
