import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import * as us from '@/lib/services/userSettingsService';

describe('userSettingsService', () => {
    it('upsert and set preferences', async () => {
        const u = await usr.ensureAppUser({ email: 'k@example.com' });

        const s1 = await us.upsertUserSettings({ userId: u.id, theme: 'dark' });
        expect(s1.theme).toBe('dark');

        const s2 = await us.setTextSize(u.id, 'L');
        expect(s2.textSize).toBe('L');

        const s3 = await us.setPreference(u.id, 'sidebarOpen', true);
        expect((s3.preferences as any)?.sidebarOpen).toBe(true);

        const s4 = await us.saveCategorySlots(u.id, [{ name: 'slot-1', numberValue: 5 }, { name: 'slot-2', numberValue: null }]);
        expect((s4.preferences as any)?.categorySlots?.['slot-1']).toBe(5);

        const pref = await us.getPreference(u.id, 'sidebarOpen');
        expect(pref).toBe(true);

        await us.deletePreference(u.id, 'sidebarOpen');
        const gone = await us.getPreference(u.id, 'sidebarOpen');
        expect(gone).toBe(null);
    });
});
