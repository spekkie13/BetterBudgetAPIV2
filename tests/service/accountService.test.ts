import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountService } from '@/service/accountService';
import type { IAccountRepository } from '@/repository/interfaces/IAccountRepository';

const mockRepo: IAccountRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  listByTeam: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
  exists: vi.fn(),
};

const service = new AccountService(mockRepo);

const mockAccountRow: any = {
  id: 1,
  teamId: 10,
  name: 'Checking',
  type: 'bank',
  currency: 'EUR',
  isArchived: false,
};

describe('AccountService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createAccount', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockAccountRow);

      const result = await service.createAccount({ teamId: 10, name: 'Checking', type: 'bank', currency: 'EUR', isArchived: false });

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAccountRow);
    });
  });

  describe('getAccountById', () => {
    it('delegates to repo.getById and returns the row', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(mockAccountRow);

      const result = await service.getAccountById(10, 1);

      expect(mockRepo.getById).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(mockAccountRow);
    });
  });

  describe('listAccounts', () => {
    it('passes teamId and includeArchived flag to repo.listByTeam', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockAccountRow]);

      const result = await service.listAccounts(10, false);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10, false);
      expect(result).toEqual([mockAccountRow]);
    });
  });

  describe('updateAccount', () => {
    it('delegates to repo.updateById and returns the updated row', async () => {
      const updated = { ...mockAccountRow, name: 'Savings' };
      vi.mocked(mockRepo.updateById).mockResolvedValue(updated);

      const result = await service.updateAccount(10, 1, { name: 'Savings' });

      expect(mockRepo.updateById).toHaveBeenCalledWith(10, 1, { name: 'Savings' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAccount', () => {
    it('delegates to repo.deleteById', async () => {
      vi.mocked(mockRepo.deleteById).mockResolvedValue(undefined);

      await service.deleteAccount(10, 1);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(10, 1);
    });
  });
});
