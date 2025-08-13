import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import * as bud from '@/lib/services/budgetService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('budgetService', () => {
    it('create/get/update/upsert budget month', async () => {
        const u = await usr.ensureAppUser({ email: 'd@example.com' });
        const teamId = await getTeamIdByUser(u)

        const c = await cat.createCategory({ teamId: teamId, name: 'Rent', color: '#333', icon: 'home' });

        const created = await bud.createBudget({ teamId: teamId, categoryId: c.id, month: '2025-08', amount: 1000 });
        expect(created.amountCents).toBe(100000);

        const byMonth = await bud.getBudgetsByMonth(teamId, '2025-08');
        expect(byMonth.length).toBe(1);

        const byCat = await bud.getBudgetByMonthAndCategory(teamId, '2025-08', c.id);
        expect(byCat?.id).toBe(created.id);

        const up = await bud.updateBudget({ id: created.id, teamId: teamId, amount: 1200 });
        expect(up?.amountCents).toBe(120000);

        const upserted = await bud.upsertBudget({ teamId: teamId, categoryId: c.id, month: '2025-08', amount: 1300, rollover: true });
        expect(upserted?.amountCents).toBe(130000);
        expect(upserted?.rollover).toBe(true);

        await bud.deleteBudgetById(teamId, created.id);
        const after = await bud.getBudgetsByMonth(teamId, '2025-08');
        expect(after.length).toBe(0);
    });
});
