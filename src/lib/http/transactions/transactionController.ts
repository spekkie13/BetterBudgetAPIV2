// lib/http/transactions/transactionController.ts
import { monthRange } from '@/lib/utils/date';
import { decodeCursor, encodeCursor } from './cursor';
import * as repo from './transactionRepo';

type Params = {
    teamId: number;
    month?: string;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: number;
    accountId?: number;
    limit: number;
    cursor?: string | null;
    id?: number;
};

export async function getTransactions(params: Params) {
    const { teamId, month, type, categoryId, accountId, limit, cursor, id } = params;

    // path 1: by id (unchanged)
    if (id !== undefined) {
        if (!Number.isInteger(id)) return { status: 400, body: { error: 'Invalid id' } };
        const row = await repo.getById(teamId, id);
        return { status: 200, body: row ?? {} };
    }

    // path 2: list (all-time OR month)
    // month optional: when provided we scope by month; otherwise all-time.
    let start: Date | undefined;
    let end: Date | undefined;

    if (month) {
        // Validate + compute range
        try {
            const r = monthRange(month);
            start = r.start;
            end = r.end;
        } catch {
            return { status: 400, body: { error: 'month must be YYYY-MM' } };
        }
    }

    const cur = decodeCursor(cursor);

    const { items, nextCursor } = await repo.list(
        {
            teamId,
            start,         // undefined => all-time
            end,           // undefined => all-time
            cursor: cur,
            type,
            categoryId,
            accountId,
        },
        limit
    );

    return { status: 200, body: { items, nextCursor: encodeCursor(nextCursor) } };
}
