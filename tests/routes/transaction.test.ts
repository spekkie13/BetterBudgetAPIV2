// tests/routes/transactions.test.ts
import { describe, it, expect } from 'vitest';
import { jsonReq, buildUrl } from '../utils/http';

import { GET as TxGET, POST as TxPOST } from '@/app/api/transactions/route';
import { PUT as TxByIdPUT, DELETE as TxByIdDELETE } from '@/app/api/transactions/[id]/route';

import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('transactions endpoints', () => {
    it('GET filters and pagination + POST + PUT + DELETE', async () => {
        const u = await usr.ensureAppUser({ email: `x_${Date.now()}@ex.com` });
        const teamId = await getTeamIdByUser(u)

        const a = await usr.createAccount({ teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        const c = await cat.createCategory({ teamId, name: 'Food', color: '#111', icon: 'f' });

        // POST expense
        const p = await TxPOST(jsonReq('POST', buildUrl('/api/transactions'), {
            teamId, accountId: a.id, amount: 25, date: '2025-08-04', categoryId: c.id, description: 'Lunch',
        }) as any);
        expect(p.status).toBe(201);
        const created = await p.json();

        // GET list by month & type
        const list = await TxGET(jsonReq('GET', buildUrl('/api/transactions', { teamId, month: '2025-08', type: 'expense', limit: 1 })) as any);
        expect(list.status).toBe(200);
        const data = await list.json();
        expect(Array.isArray(data.items)).toBe(true);
        const nextCursor = data.nextCursor ?? null;

        if (nextCursor) {
            const next = await TxGET(jsonReq('GET', buildUrl('/api/transactions', { teamId, month: '2025-08', cursor: nextCursor })) as any);
            expect(next.status).toBe(200);
        }

        // PUT update
        const id = created.data.id;
        const put = await TxByIdPUT(
            jsonReq('PUT', buildUrl(`/api/transactions/${id}`, { teamId }), { description: 'Lunch w/ friends' }) as any,
            { params: { id: String(id) } } as any
        );
        expect(put.status).toBe(200);
        const upd = await put.json();
        expect(upd.data.memo).toBe('Lunch w/ friends');

        // DELETE
        const del = await TxByIdDELETE(
            jsonReq('DELETE', buildUrl(`/api/transactions/${id}`), { teamId }) as any,
            { params: { id: String(id) } } as any
        );
        expect(del.status).toBe(200);
    });

    it('400 on invalid teamId', async () => {
        const res = await TxGET(jsonReq('GET', buildUrl('/api/transactions', { teamId: 'NaN' })) as any);
        expect(res.status).toBe(400);
    });
});
