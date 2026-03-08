import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '@/service/categoryService';
import type { ICategoryRepository } from '@/repository/interfaces/ICategoryRepository';

const mockRepo: ICategoryRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  listByTeam: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
  exists: vi.fn(),
};

const service = new CategoryService(mockRepo);

const mockCategoryRow: any = {
  id: 1,
  teamId: 10,
  name: 'Groceries',
  type: 'expense',
  color: '#FF5733',
  icon: 'shopping-cart',
  parentId: null,
};

describe('CategoryService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createCategory', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockCategoryRow);

      const result = await service.createCategory({ teamId: 10, name: 'Groceries', type: 'expense', color: '#FF5733', icon: 'shopping-cart' });

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategoryRow);
    });
  });

  describe('getCategoryById', () => {
    it('calls repo.getById when an id is provided', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(mockCategoryRow);

      const result = await service.getCategoryById(10, 1);

      expect(mockRepo.getById).toHaveBeenCalledWith(10, 1);
      expect(mockRepo.listByTeam).not.toHaveBeenCalled();
      expect(result).toEqual(mockCategoryRow);
    });

    it('calls repo.listByTeam when id is null', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockCategoryRow]);

      const result = await service.getCategoryById(10, null);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10);
      expect(mockRepo.getById).not.toHaveBeenCalled();
      expect(result).toEqual([mockCategoryRow]);
    });

    it('calls repo.listByTeam when id is undefined', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockCategoryRow]);

      const result = await service.getCategoryById(10);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockCategoryRow]);
    });
  });

  describe('categoryExists', () => {
    it('returns true when the category exists', async () => {
      vi.mocked(mockRepo.exists).mockResolvedValue(true);

      const result = await service.categoryExists(10, 1);

      expect(mockRepo.exists).toHaveBeenCalledWith(10, 1);
      expect(result).toBe(true);
    });

    it('returns false when the category does not exist', async () => {
      vi.mocked(mockRepo.exists).mockResolvedValue(false);

      const result = await service.categoryExists(10, 999);

      expect(result).toBe(false);
    });
  });

  describe('updateCategory', () => {
    it('delegates to repo.updateById and returns the updated row', async () => {
      const updated = { ...mockCategoryRow, name: 'Food & Drink' };
      vi.mocked(mockRepo.updateById).mockResolvedValue(updated);

      const result = await service.updateCategory(10, 1, { name: 'Food & Drink' });

      expect(mockRepo.updateById).toHaveBeenCalledWith(10, 1, { name: 'Food & Drink' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteCategory', () => {
    it('delegates to repo.deleteById', async () => {
      vi.mocked(mockRepo.deleteById).mockResolvedValue(undefined);

      await service.deleteCategory(10, 1);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(10, 1);
    });
  });

  describe('selectAllByTeam', () => {
    it('delegates to repo.listByTeam', async () => {
      vi.mocked(mockRepo.listByTeam).mockResolvedValue([mockCategoryRow]);

      const result = await service.selectAllByTeam(10);

      expect(mockRepo.listByTeam).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockCategoryRow]);
    });
  });
});
