import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '@/service/transactionService';
import { BadRequestError } from '@/models/errors';
import type { ITransactionRepository } from '@/repository/interfaces/ITransactionRepository';

const mockRepo: ITransactionRepository = {
  create: vi.fn(),
  selectById: vi.fn(),
  selectByTeam: vi.fn(),
  selectIncomes: vi.fn(),
  selectExpenses: vi.fn(),
  selectTransfers: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
};

const service = new TransactionService(mockRepo);

const now = new Date('2024-03-15T10:00:00Z');

const mockTxRow: any = {
  id: 1,
  teamId: 10,
  accountId: 2,
  amountCents: -5000,
  currency: 'EUR',
  postedAt: now,
  payee: 'Supermarket',
  memo: null,
  categoryId: 1,
  isTransfer: false,
  transferGroupId: null,
  createdBy: 1,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

describe('TransactionService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createTransaction', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockTxRow);

      const result = await service.createTransaction({ teamId: 10, accountId: 2, amountCents: -5000, currency: 'EUR', postedAt: now, isTransfer: false } as any);

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTxRow);
    });
  });

  describe('selectTransactionById', () => {
    it('delegates to repo.selectById', async () => {
      vi.mocked(mockRepo.selectById).mockResolvedValue(mockTxRow);

      const result = await service.selectTransactionById(10, 1);

      expect(mockRepo.selectById).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(mockTxRow);
    });
  });

  describe('selectByTeam', () => {
    it('delegates to repo.selectByTeam', async () => {
      vi.mocked(mockRepo.selectByTeam).mockResolvedValue([mockTxRow]);

      const result = await service.selectByTeam(10);

      expect(mockRepo.selectByTeam).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockTxRow]);
    });
  });

  describe('selectTransactionsByType', () => {
    it('calls repo.selectIncomes for type "income"', async () => {
      vi.mocked(mockRepo.selectIncomes).mockResolvedValue([mockTxRow]);

      const result = await service.selectTransactionsByType(10, 'income');

      expect(mockRepo.selectIncomes).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockTxRow]);
    });

    it('calls repo.selectExpenses for type "expense"', async () => {
      vi.mocked(mockRepo.selectExpenses).mockResolvedValue([mockTxRow]);

      const result = await service.selectTransactionsByType(10, 'expense');

      expect(mockRepo.selectExpenses).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockTxRow]);
    });

    it('calls repo.selectTransfers for type "transfer"', async () => {
      vi.mocked(mockRepo.selectTransfers).mockResolvedValue([mockTxRow]);

      const result = await service.selectTransactionsByType(10, 'transfer');

      expect(mockRepo.selectTransfers).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockTxRow]);
    });

    it('throws BadRequestError for an unknown type', async () => {
      await expect(service.selectTransactionsByType(10, 'invalid')).rejects.toThrow(BadRequestError);
      await expect(service.selectTransactionsByType(10, 'invalid')).rejects.toThrow('Invalid transaction type');
    });
  });

  describe('updateTransaction', () => {
    it('delegates to repo.updateById and returns the updated row', async () => {
      const updated = { ...mockTxRow, payee: 'Farmers Market' };
      vi.mocked(mockRepo.updateById).mockResolvedValue(updated);

      const result = await service.updateTransaction(10, 1, { payee: 'Farmers Market' });

      expect(mockRepo.updateById).toHaveBeenCalledWith(10, 1, { payee: 'Farmers Market' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTransaction', () => {
    it('delegates to repo.deleteById', async () => {
      vi.mocked(mockRepo.deleteById).mockResolvedValue(undefined);

      await service.deleteTransaction(10, 1);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(10, 1);
    });
  });
});
