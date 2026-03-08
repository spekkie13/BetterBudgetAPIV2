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

const { BudgetRepository } = await import('@/repository/budgetRepo');
const { BudgetNotFoundError } = await import('@/models/errors/budget/NotFound');

const repo = new BudgetRepository();

const mockBudgetRow = {
  id: 1,
  teamId: 10,
  categoryId: 5,
  periodMonth: '2024-03-01',
  amountCents: 50000,
  rollover: false,
};

describe('BudgetRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('inserts a budget and returns the new row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.create({
        teamId: 10,
        categoryId: 5,
        periodMonth: '2024-03-01',
        amountCents: 50000,
        rollover: false,
      });

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBudgetRow);
    });
  });

  describe('getById', () => {
    it('returns the budget for the given team and id', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.getById(10, 1);

      expect(result).toEqual(mockBudgetRow);
    });

    it('returns undefined when not found', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.getById(10, 999);

      expect(result).toBeUndefined();
    });
  });

  describe('listByTeam', () => {
    it('returns all budgets for the team', async () => {
      const rows = [mockBudgetRow, { ...mockBudgetRow, id: 2 }];
      vi.mocked(db.select).mockReturnValue(makeChain(rows) as any);

      const result = await repo.listByTeam(10);

      expect(result).toEqual(rows);
    });
  });

  describe('updateById', () => {
    it('updates a budget and returns the updated row', async () => {
      const updated = { ...mockBudgetRow, amountCents: 75000 };
      vi.mocked(db.update).mockReturnValue(makeChain([updated]) as any);

      const result = await repo.updateById(10, 1, { amountCents: 75000 });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updated);
    });

    it('throws BudgetNotFoundError when no row is returned', async () => {
      vi.mocked(db.update).mockReturnValue(makeChain([]) as any);

      await expect(repo.updateById(10, 999, { amountCents: 100 })).rejects.toThrow(BudgetNotFoundError);
    });
  });

  describe('deleteById', () => {
    it('deletes a budget without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.deleteById(10, 1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists', () => {
    it('returns true when budget exists', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.exists(10, 1);

      expect(result).toBe(true);
    });

    it('returns false when budget does not exist', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.exists(10, 999);

      expect(result).toBe(false);
    });
  });

  describe('selectByMonth', () => {
    it('returns budgets for the given team and month', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.selectByMonth(10, '2024-03-01');

      expect(result).toEqual([mockBudgetRow]);
    });
  });

  describe('selectByCategory', () => {
    it('returns budgets for the given team and category', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.selectByCategory(10, 5);

      expect(result).toEqual([mockBudgetRow]);
    });
  });

  describe('selectByMonthAndCategory', () => {
    it('returns the budget for the given team, month and category', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockBudgetRow]) as any);

      const result = await repo.selectByMonthAndCategory(10, '2024-03-01', 5);

      expect(result).toEqual(mockBudgetRow);
    });

    it('throws when no budget is found', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      await expect(repo.selectByMonthAndCategory(10, '2024-03-01', 5)).rejects.toThrow();
    });
  });
});
