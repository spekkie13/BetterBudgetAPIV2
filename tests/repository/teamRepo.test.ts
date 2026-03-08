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

const { TeamRepository } = await import('@/repository/teamRepo');

const repo = new TeamRepository();

const mockTeamRow = {
  id: 1,
  name: 'Budget Squad',
  createdAt: new Date('2024-01-01'),
};

describe('TeamRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('inserts a team and returns the new row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockTeamRow]) as any);

      const result = await repo.create({ name: 'Budget Squad' });

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTeamRow);
    });
  });

  describe('getById', () => {
    it('returns the team row for the given id', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([mockTeamRow]) as any);

      const result = await repo.getById(1);

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTeamRow);
    });

    it('returns undefined when the team does not exist', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.getById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateById', () => {
    it('updates a team and returns the updated row', async () => {
      const updated = { ...mockTeamRow, name: 'New Name' };
      vi.mocked(db.update).mockReturnValue(makeChain([updated]) as any);

      const result = await repo.updateById(1, { name: 'New Name' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a team without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.deleteById(1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectAll', () => {
    it('returns all teams', async () => {
      const rows = [mockTeamRow, { ...mockTeamRow, id: 2, name: 'Team B' }];
      vi.mocked(db.select).mockReturnValue(makeChain(rows) as any);

      const result = await repo.selectAll();

      expect(result).toEqual(rows);
    });

    it('returns an empty array when there are no teams', async () => {
      vi.mocked(db.select).mockReturnValue(makeChain([]) as any);

      const result = await repo.selectAll();

      expect(result).toEqual([]);
    });
  });
});