import { getMonthSummary, getCategorySummary } from '@/lib/services/summaryService';
import { seedTeamUser, seedAccount, seedCategory } from '../utils/fixtures';
import * as budgetSvc from '@/lib/services/budgetService';
import * as txnSvc from '@/lib/services/transactionService';

describe('summaryService', () => {
    it('computes per-category totals (budget, spent, income, net, remaining, percentSpent)', async () => {
        const { teamId } = await seedTeamUser();
        const acct = await seedAccount(teamId);
        const cat = await seedCategory(teamId, 'Groceries');

        await budgetSvc.upsertBudget({ teamId, categoryId: cat.id, month: '2025-08', amount: 300, rollover: false });

        await txnSvc.createIncome({ teamId, accountId: acct.id, categoryId: cat.id, amount: 100, date: '2025-08-01' });
        await txnSvc.createExpense({ teamId, accountId: acct.id, categoryId: cat.id, amount: 90, date: '2025-08-02' });

        const month = '2025-08';
        const rows = await getMonthSummary(teamId, month);
        const row = rows.find(r => r.categoryId === cat.id)!;

        expect(row.budget).toBe(300);
        expect(row.income).toBe(100);
        expect(row.spent).toBe(90);
        expect(row.remaining).toBe(210);
        expect(row.net).toBe(10);
        expect(row.percentSpent).toBeCloseTo(30, 1);

        const single = await getCategorySummary(teamId, month, cat.id);
        expect(single.categoryId).toBe(cat.id);
    });
});
