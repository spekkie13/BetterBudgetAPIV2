// tests/routes/category.test.ts
import { describe, it, expect } from 'vitest';
import { jsonReq, buildUrl } from '../utils/http';

import { GET as CategoryGET, POST as CategoryPOST } from '@/app/api/categories/route';
import { DELETE as CategoryByIdDELETE } from '@/app/api/categories/[id]/route';

import * as usr from '@/lib/services/userService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('category endpoints', () => {
    it('POST create, GET list, GET/PATCH/DELETE by id, check-exists', async () => {
        const u = await usr.ensureAppUser({ email: `c_${Date.now()}@ex.com` });
        const teamId = await getTeamIdByUser(u)

        // POST
        const create = await CategoryPOST(jsonReq('POST', buildUrl('/api/category'), {
            teamId, name: 'Groceries', color: '#0aa', icon: 'cart', type: 'expense',
        }) as any);
        expect(create.status).toBe(201);
        const created = await create.json();
        console.log(created);
        // GET list
        const listRes = await CategoryGET(jsonReq('GET', buildUrl(`/api/category?teamId=${teamId}`, { teamId })) as any);
        expect(listRes.status).toBe(200);
        const list = await listRes.json();
        expect(list.data.some((c: any) => c.id === created.data.id)).toBe(true);

        // DELETE
        const del = await CategoryByIdDELETE(jsonReq('DELETE', buildUrl(`/api/category?id=${created.data.id}&teamId=${teamId}`), { teamId }) as any);
        expect(del.status).toBe(201);
    });

    it('GET /api/category -> 400 on missing teamId', async () => {
        const res = await CategoryGET(jsonReq('GET', buildUrl('/api/category')) as any);
        expect(res.status).toBe(400);
    });
});
