import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/db/client';
import { makeChain } from '../helpers/mockChain';

vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { TransactionRepo } = await import('@/repository/transactionRepo');

const repo = new TransactionRepo();

const now = new Date('2024-03-15T10:00:00Z');

const mockIncome: any = {
  id: 1,
  teamId: 10,
  accountId: 2,
  amountCents: 200000,
  currency: 'EUR',
  postedAt: now,
  payee: 'Employer',
  memo: 'Salary',
  categoryId: null,
  isTransfer: false,
  transferGroupId: null,
  createdBy: 1,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

const mockExpense: any = {
  ...mockIncome,
  id: 2,
  amountCents: -5000,
  payee: 'Supermarket',
  memo: 'Weekly groceries',
};

const mockTransfer: any = {
  ...mockIncome,
  id: 3,
  isTransfer: true,
  transferGroupId: 99,
};

describe('TransactionRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('inserts a transaction and returns the new row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockIncome]) as any);

      const result = await repo.create({
        teamId: 10,
        accountId: 2,
        amountCents: 200000,
        currency: 'EUR',
        postedAt: now,
        isTransfer: false,
      } as any);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockIncome);
    });
  });

  describe('selectById', () => {
    it('returns the transaction for the given team and id', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockIncome]) as any);

      const result = await repo.selectById(10, 1);

      expect(result).toEqual(mockIncome);
    });

    it('returns undefined when not found', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.selectById(10, 999);

      expect(result).toBeUndefined();
    });
  });

  describe('selectByTeam', () => {
    it('returns all transactions for the team', async () => {
      const rows = [mockIncome, mockExpense];
      vi.mocked(db.select).mockReturnValue(makeChain(rows) as any);

      const result = await repo.selectByTeam(10);

      expect(result).toEqual(rows);
    });
  });

  describe('selectIncomes', () => {
    it('returns only transactions with positive amounts', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockIncome, mockExpense]) as any);

      const result = await repo.selectIncomes(10);

      expect(result).toHaveLength(1);
      expect(result[0].amountCents).toBeGreaterThan(0);
    });

    it('returns empty array when there are no incomes', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockExpense]) as any);

      const result = await repo.selectIncomes(10);

      expect(result).toEqual([]);
    });
  });

  describe('selectExpenses', () => {
    it('returns only transactions with negative amounts', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockIncome, mockExpense]) as any);

      const result = await repo.selectExpenses(10);

      expect(result).toHaveLength(1);
      expect(result[0].amountCents).toBeLessThan(0);
    });

    it('returns empty array when there are no expenses', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockIncome]) as any);

      const result = await repo.selectExpenses(10);

      expect(result).toEqual([]);
    });
  });

  describe('selectTransfers', () => {
    it('returns only transfer transactions', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockTransfer]) as any);

      const result = await repo.selectTransfers(10);

      expect(result).toEqual([mockTransfer]);
    });
  });

  describe('updateById', () => {
    it('updates a transaction and returns the updated row', async () => {
      const updated = { ...mockExpense, payee: 'Farmers Market' };
      vi.mocked(db.update).mockReturnValue(makeChain([updated]) as any);

      const result = await repo.updateById(10, 2, { payee: 'Farmers Market' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a transaction without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.deleteById(10, 1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });
});
