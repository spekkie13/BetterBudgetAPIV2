import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import * as txn from '@/lib/services/transactionService';
import { calculateMonthRange } from '@/lib/services/monthService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('transactionService', () => {
    it('expense/income sign and currency fallback', async () => {
        const u = await usr.ensureAppUser({ email: 'g@example.com' });
        const teamId = await getTeamIdByUser(u)

        const a = await usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        const c = await cat.createCategory({ teamId: teamId, name: 'Misc', color: '#abc', icon: 'm' });

        const e = await txn.createExpense({ teamId: teamId, accountId: a.id, amount: 12.34, date: '2025-08-10', categoryId: c.id });
        expect(e.amountCents).toBe(-1234);
        expect(e.currency).toBe('EUR');

        const i = await txn.createIncome({ teamId: teamId, accountId: a.id, amount: 99, date: '2025-08-11', categoryId: c.id });
        expect(i.amountCents).toBe(9900);
    });

    it('split-aware reads by type and category', async () => {
        const u = await usr.ensureAppUser({ email: 'h@example.com' });
        const teamId = await getTeamIdByUser(u)

        const a = await usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        const c1 = await cat.createCategory({ teamId: teamId, name: 'Food', color: '#0aa', icon: 'f' });
        const c2 = await cat.createCategory({ teamId: teamId, name: 'Fun', color: '#0bb', icon: 'u' });

        await txn.createExpense({ teamId: teamId, accountId: a.id, date: '2025-08-05', amount: 50, categoryId: c1.id });
        await txn.createExpense({ teamId: teamId, accountId: a.id, date: '2025-08-06', amount: 30, splits: [{ categoryId: c2.id, amount: 30 }] });
        await txn.createIncome({ teamId: teamId, accountId: a.id, date: '2025-08-07', amount: 200, categoryId: c1.id });

        const period = calculateMonthRange(new Date('2025-08-15'));

        const onlyExpenses = await txn.getTransactionsByTeamAndPeriod(teamId, period, { type: 'expense' });
        expect(onlyExpenses.every((t: any) => t.amountCents < 0)).toBe(true);

        const onlyIncome = await txn.getTransactionsByTeamAndPeriod(teamId, period, { type: 'income' });
        expect(onlyIncome.every((t: any) => t.amountCents > 0)).toBe(true);

        const byCatFood = await txn.getTransactionsByTeamAndPeriod(teamId, period, { categoryId: c1.id });
        expect(byCatFood.length).toBeGreaterThan(0);

        const byCatFunExpense = await txn.getTransactionsByTeamAndPeriod(teamId, period, { categoryId: c2.id, type: 'expense' });
        expect(byCatFunExpense.length).toBe(1);
    });

    it('updateTransaction with splits enforces equality and nulls base category', async () => {
        const u = await usr.ensureAppUser({ email: 'i@example.com' });
        const teamId = await getTeamIdByUser(u)

        const a = await usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        const c = await cat.createCategory({ teamId: teamId, name: 'Groceries', color: '#0aa', icon: 'g' });

        const e = await txn.createExpense({ teamId: teamId, accountId: a.id, amount: 40, date: '2025-08-08', categoryId: c.id });
        await expect(txn.updateTransaction({
            id: e.id, teamId: teamId, kind: 'expense',
            splits: [{ categoryId: c.id, amount: 10 }],
        })).rejects.toThrow(/Sum of split amounts/);

        const ok = await txn.updateTransaction({
            id: e.id, teamId: teamId, kind: 'expense',
            splits: [{ categoryId: c.id, amount: 20 }, { categoryId: c.id, amount: 20 }],
        });
        expect(ok.categoryId).toBeNull();
    });

    it('createTransfer creates two legs with shared transferGroupId', async () => {
        const u = await usr.ensureAppUser({ email: 'j@example.com' });
        const teamId = await getTeamIdByUser(u)

        const a1 = await usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        const a2 = await usr.createAccount({ teamId: teamId, name: 'Savings', type: 'bank', currency: 'EUR' });

        const t = await txn.createTransfer({ teamId: teamId, fromAccountId: a1.id, toAccountId: a2.id, amount: 55.5, date: '2025-08-10' });
        expect(t.transferGroupId).toBeTruthy();
    });
});
