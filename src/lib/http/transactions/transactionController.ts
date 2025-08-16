// lib/http/transactions/transactionController.ts
import { monthRange } from '@/lib/utils/date';
import { decodeCursor, encodeCursor } from './cursor';
import * as repo from './transactionRepo';

type Params = {
    teamId: number;
    month?: string;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: number;
    limit: number;
    cursor?: string | null;
    id?: number;
};

export async function getTransactions(params: Params) {
    const { teamId, month, type, categoryId, limit, cursor, id } = params;

    // path 1: by id
    if (id !== undefined) {
        if (!Number.isInteger(id)) return { status: 400, body: { error: 'Invalid id' } };
        const row = await repo.getById(teamId, id);
        return { status: 200, body: row ?? {} };
    }

    // path 2: lists require month
    if (!month) {
        return { status: 400, body: { error: 'month is required (YYYY-MM)' } };
    }

    const { start, end } = monthRange(month);
    const cur = decodeCursor(cursor);

    if (categoryId === undefined) {
        const { items, nextCursor } = await repo.listBase({ teamId, start, end, cursor: cur, type }, limit);
        return { status: 200, body: { items, nextCursor: encodeCursor(nextCursor) } };
    } else {
        const { items, nextCursor } = await repo.listWithCategory(
            { teamId, start, end, cursor: cur, type, categoryId },
            limit
        );
        return { status: 200, body: { items, nextCursor: encodeCursor(nextCursor) } };
    }
}
