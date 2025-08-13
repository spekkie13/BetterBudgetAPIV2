// tests/routes/teams.test.ts
import { describe, it, expect } from 'vitest';
import { jsonReq, buildUrl } from '../utils/http';

import { GET as TeamsGET, POST as TeamsPOST } from '@/app/api/teams/route';
import { GET as TeamByIdGET, PUT as TeamByIdPUT, DELETE as TeamByIdDELETE } from '@/app/api/teams/[teamId]/route';
import { GET as TrendGET } from '@/app/api/teams/[teamId]/budgets/trend/route';

import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('teams endpoints', () => {
    it('teams CRUD + show', async () => {
        // POST (create via route if you have it; else seed via service)
        const req = jsonReq('POST', buildUrl('/api/teams'), { name: `Team ${Date.now()}`});
        const createRes = await TeamsPOST(req);
        expect(createRes.status).toBe(201);
        const created = await createRes.json();

        // GET list
        const list = await TeamsGET(jsonReq('GET', buildUrl('/api/teams')) as any);
        expect(list.status).toBe(200);

        // GET /teams/[id]
        const byId = await TeamByIdGET(jsonReq('GET', buildUrl(`/api/teams?id=${created.data.id}`)) as any);
        expect(byId.status).toBe(200);

        // PUT
        const put = await TeamByIdPUT(jsonReq('PUT', buildUrl(`/api/teams?id=${created.data.id}`), { name: 'Renamed' }) as any);
        expect(put.status).toBe(201);

        // DELETE
        const del = await TeamByIdDELETE(jsonReq('DELETE', buildUrl(`/api/teams?id=${created.data.id}`)) as any);
        expect(del.status).toBe(201);
    });

    it('team budgets + trend', async () => {
        const u = await usr.ensureAppUser({ email: `t_${Date.now()}@ex.com` });
        const teamId = await getTeamIdByUser(u)

        const c = await cat.createCategory({ teamId, name: 'Groceries', color: '#0aa', icon: 'cart' });

        // GET /teams/[teamId]/budgets/trend?months=6
        const trend = await TrendGET(
            jsonReq('GET', buildUrl(`/api/teams/${teamId}/budgets/trend`, { months: 6 })) as any,
            { params: { teamId: String(c.teamId) } } as any
        );
        expect(trend.status).toBe(200);
        const data = await trend.json();
        expect(Array.isArray(data.points)).toBe(true);
    });
});
