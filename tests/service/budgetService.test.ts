import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetService } from '@/service/budgetService';
import type { IBudgetRepository } from '@/repository/interfaces/IBudgetRepository';

const mockRepo: IBudgetRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  listByTeam: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
  exists: vi.fn(),
  selectByMonth: vi.fn(),
  selectByCategory: vi.fn(),
  selectByMonthAndCategory: vi.fn(),
};

const service = new BudgetService(mockRepo);

const mockBudgetRow: any = {
  id: 1,
  teamId: 10,
  categoryId: 5,
  periodMonth: '2024-03-01',
  amountCents: 50000,
  rollover: false,
};

describe('BudgetService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createBudget', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockBudgetRow);

      const input = { teamId: 10, categoryId: 5, periodMonth: '2024-03-01', amountCents: 50000, rollover: false };
      const result = await service.createBudget(input);

      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockBudgetRow);
    });
  });

  describe('getBudgetById', () => {
    it('delegates to repo.getById', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(mockBudgetRow);

      const result = await service.getBudgetById(10, 1);

      expect(mockRepo.getById).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(mockBudgetRow);
    });
  });

  describe('getBudgets', () => {
    it('calls selectByMonthAndCategory when both month and categoryId are provided', async () => {
      vi.mocked(mockRepo.selectByMonthAndCategory).mockResolvedValue(mockBudgetRow);

      const result = await service.getBudgets(10, '2024-03', 5);

      expect(mockRepo.selectByMonthAndCategory).toHaveBeenCalledWith(10, '2024-03-01', 5);
      expect(result).toEqual(mockBudgetRow);
    });

    it('calls selectByCategory when only categoryId is provided', async () => {
      vi.mocked(mockRepo.selectByCategory).mockResolvedValue([mockBudgetRow]);

      const result = await service.getBudgets(10, null, 5);

      expect(mockRepo.selectByCategory).toHaveBeenCalledWith(10, 5);
      expect(result).toEqual([mockBudgetRow]);
    });

    it('calls selectByMonth when only month is provided', async () => {
      vi.mocked(mockRepo.selectByMonth).mockResolvedValue([mockBudgetRow]);

      const result = await service.getBudgets(10, '2024-03');

      expect(mockRepo.selectByMonth).toHaveBeenCalledWith(10, '2024-03-01');
      expect(result).toEqual([mockBudgetRow]);
    });

    it('calls listByTeam when neither month nor categoryId is provided', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockBudgetRow]);

      const result = await service.getBudgets(10);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockBudgetRow]);
    });
  });

  describe('budgetExists', () => {
    it('returns true when the budget exists', async () => {
      vi.mocked(mockRepo.exists).mockResolvedValue(true);

      expect(await service.budgetExists(10, 1)).toBe(true);
      expect(mockRepo.exists).toHaveBeenCalledWith(10, 1);
    });

    it('returns false when the budget does not exist', async () => {
      vi.mocked(mockRepo.exists).mockResolvedValue(false);

      expect(await service.budgetExists(10, 999)).toBe(false);
    });
  });

  describe('updateBudget', () => {
    it('delegates to repo.updateById and returns the updated row', async () => {
      const updated = { ...mockBudgetRow, amountCents: 75000 };
      vi.mocked(mockRepo.updateById).mockResolvedValue(updated);

      const result = await service.updateBudget(10, 1, { amountCents: 75000 });

      expect(mockRepo.updateById).toHaveBeenCalledWith(10, 1, { amountCents: 75000 });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteBudget', () => {
    it('delegates to repo.deleteById', async () => {
      vi.mocked(mockRepo.deleteById).mockResolvedValue(undefined);

      await service.deleteBudget(10, 1);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(10, 1);
    });
  });

  describe('selectAllByTeam', () => {
    it('delegates to repo.listByTeam', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockBudgetRow]);

      const result = await service.selectAllByTeam(10);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockBudgetRow]);
    });
  });
});
