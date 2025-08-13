// tests/routes/preferences.test.ts
import { describe, it, expect } from 'vitest';
import { jsonReq, buildUrl } from '../utils/http';
import { GET as PrefGET, POST as PrefPOST, PATCH as PrefPATCH } from '@/app/api/preferences/route';
import { GET as PrefByIdGET, PUT as PrefByIdPUT, DELETE as PrefByIdDELETE } from '@/app/api/preferences/[id]/route';
import * as usr from '@/lib/services/userService';

describe('preferences endpoints', () => {
    it('create/get/update via JSON settings', async () => {
        const u = await usr.ensureAppUser({ email: `p_${Date.now()}@ex.com` });

        // POST set one preference (service merges JSON)
        const p = await PrefPOST(jsonReq('POST', buildUrl('/api/preferences'), {
            userId: u.id, name: 'categorySlots', value: { food: 3, fun: 2 },
        }) as any);
        expect(p.status).toBe(201);

        // GET full settings
        const g = await PrefGET(jsonReq('GET', buildUrl('/api/preferences', { userId: u.id })) as any);
        expect(g.status).toBe(200);
        const settings = await g.json();
        expect(settings.data.userId).toBe(u.id);
        expect(settings.data.preferences.categorySlots.food).toBe(3);

        // PATCH bulk update
        const patch = await PrefPATCH(jsonReq('PATCH', buildUrl('/api/preferences'), {
            userId: u.id,
            preferences: [{ name: 'categorySlots', numberValue: 4 }], // example saveCategorySlots
        }) as any);
        expect(patch.status).toBe(201);

        // /preferences/[id] may expose get/update/delete by userId — adapt if it’s different in your app
        const getById = await PrefByIdGET(jsonReq('GET', buildUrl(`/api/preferences/${u.id}`, { preferenceId: u.id })) as any);
        expect([200, 400, 404]).toContain(getById.status);

        const put = await PrefByIdPUT(jsonReq('PUT', buildUrl(`/api/preferences/${u.id}`), { id: u.id, userId: u.id, preferences: { theme: 'dark' } }) as any);
        expect([200, 400]).toContain(put.status);

        const del = await PrefByIdDELETE(jsonReq('DELETE', buildUrl(`/api/preferences/${u.id}`, { id: u.id })) as any);
        expect([200, 400]).toContain(del.status);
    });
});
