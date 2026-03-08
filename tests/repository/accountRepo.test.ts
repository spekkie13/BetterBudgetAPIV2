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

const { AccountRepository } = await import('@/repository/accountRepo');

const repo = new AccountRepository();

const mockAccountRow = {
  id: 1,
  teamId: 10,
  name: 'Checking',
  type: 'bank',
  currency: 'EUR',
  isArchived: false,
};

describe('AccountRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('inserts an account and returns the new row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockAccountRow]) as any);

      const result = await repo.create({
        teamId: 10,
        name: 'Checking',
        type: 'bank',
        currency: 'EUR',
        isArchived: false,
      });

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAccountRow);
    });
  });

  describe('getById', () => {
    it('returns the account for the given team and id', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockAccountRow]) as any);

      const result = await repo.getById(10, 1);

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAccountRow);
    });

    it('returns undefined when not found', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.getById(10, 999);

      expect(result).toBeUndefined();
    });
  });

  describe('listByTeam', () => {
    const archivedAccount = { ...mockAccountRow, id: 2, name: 'Old Savings', isArchived: true };

    it('returns all accounts including archived when includeArchived is true', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockAccountRow, archivedAccount]) as any);

      const result = await repo.listByTeam(10, true);

      expect(result).toHaveLength(2);
    });

    it('filters out archived accounts when includeArchived is false', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockAccountRow, archivedAccount]) as any);

      const result = await repo.listByTeam(10, false);

      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(false);
    });

    it('returns empty array when team has no accounts', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.listByTeam(10, false);

      expect(result).toEqual([]);
    });
  });

  describe('updateById', () => {
    it('updates an account and returns the updated row', async () => {
      const updated = { ...mockAccountRow, name: 'Savings' };
      vi.mocked(db.update).mockReturnValue(makeChain([updated]) as any);

      const result = await repo.updateById(10, 1, { name: 'Savings' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes an account without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.deleteById(10, 1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists', () => {
    it('returns true when account exists', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockAccountRow]) as any);

      const result = await repo.exists(10, 1);

      expect(result).toBe(true);
    });

    it('returns false when account does not exist', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.exists(10, 999);

      expect(result).toBe(false);
    });
  });
});
