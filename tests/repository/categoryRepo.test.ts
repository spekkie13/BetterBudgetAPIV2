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

const { CategoryRepository } = await import('@/repository/categoryRepo');

const repo = new CategoryRepository();

const mockCategoryRow = {
  id: 1,
  teamId: 10,
  name: 'Groceries',
  type: 'expense',
  color: '#FF5733',
  icon: 'shopping-cart',
  parentId: null,
};

describe('CategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('inserts a category and returns the new row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockCategoryRow]) as any);

      const result = await repo.create({
        teamId: 10,
        name: 'Groceries',
        type: 'expense',
        color: '#FF5733',
        icon: 'shopping-cart',
      });

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategoryRow);
    });
  });

  describe('getById', () => {
    it('returns the category for the given team and id', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockCategoryRow]) as any);

      const result = await repo.getById(10, 1);

      expect(result).toEqual(mockCategoryRow);
    });

    it('returns undefined when not found', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.getById(10, 999);

      expect(result).toBeUndefined();
    });
  });

  describe('listByTeam', () => {
    it('returns all categories for the team', async () => {
      const rows = [mockCategoryRow, { ...mockCategoryRow, id: 2, name: 'Transport' }];
      vi.mocked(db.select).mockReturnValue(makeChain(rows) as any);

      const result = await repo.listByTeam(10);

      expect(result).toEqual(rows);
    });

    it('returns empty array when team has no categories', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.listByTeam(10);

      expect(result).toEqual([]);
    });
  });

  describe('updateById', () => {
    it('updates a category and returns the updated row', async () => {
      const updated = { ...mockCategoryRow, name: 'Food & Drink' };
      vi.mocked(db.update).mockReturnValue(makeChain([updated]) as any);

      const result = await repo.updateById(10, 1, { name: 'Food & Drink' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a category without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.deleteById(10, 1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists', () => {
    it('returns true when category exists', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockCategoryRow]) as any);

      const result = await repo.exists(10, 1);

      expect(result).toBe(true);
    });

    it('returns false when category does not exist', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.exists(10, 999);

      expect(result).toBe(false);
    });
  });
});
