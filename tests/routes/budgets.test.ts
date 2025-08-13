// tests/routes/budgets.test.ts
import { describe, it, expect } from 'vitest';
import { jsonReq, buildUrl } from '../utils/http';

import { GET as BudgetsGET, POST as BudgetsPOST } from '@/app/api/budgets/route';
import { PUT as BudgetByIdPUT, DELETE as BudgetByIdDELETE } from '@/app/api/budgets/[id]/route';

import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('budgets endpoints', () => {
    it('GET /api/budgets -> 400 without teamId', async () => {
        const res = await BudgetsGET(jsonReq('GET', buildUrl('/api/budgets')) as any);
        expect(res.status).toBe(400);
    });

    it('POST create, GET list by month, GET/PUT/DELETE by id', async () => {
        const u = await usr.ensureAppUser({ email: `b_${Date.now()}@ex.com` });
        const teamId = await getTeamIdByUser(u)

        const c = await cat.createCategory({ teamId, name: 'Rent', color: '#111', icon: 'home' });

        // POST
        const createRes = await BudgetsPOST(
            jsonReq('POST', buildUrl('/api/budgets'), {
                teamId, categoryId: c.id, month: '2025-08', amount: 999.5, rollover: true,
            }) as any
        );
        expect(createRes.status).toBe(201);
        const created = await createRes.json();
        expect(created.data.amountCents).toBe(99950);

        // GET list by month
        const listRes = await BudgetsGET(jsonReq('GET', buildUrl('/api/budgets', { teamId, month: '2025-08' })) as any);
        expect(listRes.status).toBe(200);
        const listData = await listRes.json();
        expect(Array.isArray(listData.data)).toBe(true);
        const row = listData.data.find((r: any) => r.categoryId === c.id);
        expect(row?.amountCents).toBe(99950);

        // PUT update
        let req = jsonReq('PUT', buildUrl(`/api/budgets/${created.data.id}`), {
            teamId, amount: 1200, rollover: false
        })

        const id = created.data.id;
        const putRes = await BudgetByIdPUT(req,
            { params: { id: String(id) } } as any
        );
        expect(putRes.status).toBe(200);
        const updated = await putRes.json();
        expect(updated.data.amountCents).toBe(120000);
        expect(updated.data.rollover).toBe(false);

        // DELETE
        req = jsonReq('POST', buildUrl(`/api/budgets/${created.data.id}`), {
            teamId,
        })
        const delRes = await BudgetByIdDELETE(req,
            { params: { id: String(id) } } as any);
        expect(delRes.status).toBe(200);
    });
});
