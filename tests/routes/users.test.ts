// tests/routes/users.test.ts
import { describe, it, expect } from 'vitest';
import {buildUrl, jsonReq} from '../utils/http';

import { GET as UsersGET, POST as UsersPOST } from '@/app/api/users/route';
import { GET as UserByIdGET, PUT as UserByIdPUT, DELETE as UserByIdDELETE } from '@/app/api/users/[id]/route';

describe('users endpoints', () => {
    it('POST create, GET list, GET/PUT/DELETE by id', async () => {
        // POST
        const create = await UsersPOST(jsonReq('POST', buildUrl('/api/users'), {
            email: `u_${Date.now()}@ex.com`,
            username: `u_${Date.now()}`,
            name: 'Some User',
        }) as any);
        expect([200, 201]).toContain(create.status);
        const created = await create.json();
        console.log(created.data)

        // GET list
        const list = await UsersGET(jsonReq('GET', buildUrl('/api/users')) as any);
        expect(list.status).toBe(200);
        const arr = await list.json();
        expect(arr.data.some((x: any) => x.id === created.data.id)).toBe(true);

        // GET by id
        const byId = await UserByIdGET(jsonReq('GET', buildUrl(`/api/users?userId=${created.data.id}`)) as any);
        expect(byId.status).toBe(200);

        // PUT update
        const put = await UserByIdPUT(jsonReq('PUT', buildUrl(`/api/users?id=${created.data.id}`), { name: 'Renamed' }) as any);
        expect(put.status).toBe(200);
        const updated = await put.json();
        console.log(updated.data)
        expect(updated.data.name).toBe('Renamed');

        // DELETE
        const del = await UserByIdDELETE(jsonReq('DELETE', buildUrl(`/api/users?id=${created.data.id}`)) as any);
        expect(del.status).toBe(200);
    });
});
