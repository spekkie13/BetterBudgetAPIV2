import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamService } from '@/service/teamService';
import type { ITeamRepository } from '@/repository/interfaces/ITeamRepository';

const mockRepo: ITeamRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
  selectAll: vi.fn(),
};

const service = new TeamService(mockRepo);

const mockTeamRow: any = {
  id: 1,
  name: 'Budget Squad',
  createdAt: new Date(),
};

describe('TeamService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createTeam', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockTeamRow);

      const result = await service.createTeam({ name: 'Budget Squad' });

      expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Budget Squad' });
      expect(result).toEqual(mockTeamRow);
    });
  });

  describe('getTeamById', () => {
    it('delegates to repo.getById and returns the row', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(mockTeamRow);

      const result = await service.getTeamById(1);

      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTeamRow);
    });
  });

  describe('updateTeam', () => {
    it('delegates to repo.updateById and returns the updated row', async () => {
      const updated = { ...mockTeamRow, name: 'New Name' };
      vi.mocked(mockRepo.updateById).mockResolvedValue(updated);

      const result = await service.updateTeam(1, { name: 'New Name' });

      expect(mockRepo.updateById).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTeam', () => {
    it('delegates to repo.deleteById', async () => {
      vi.mocked(mockRepo.deleteById).mockResolvedValue(undefined);

      await service.deleteTeam(1);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('listAll', () => {
    it('delegates to repo.selectAll and returns all teams', async () => {
      const rows = [mockTeamRow, { ...mockTeamRow, id: 2, name: 'Team B' }];
      vi.mocked(mockRepo.selectAll).mockResolvedValue(rows);

      const result = await service.listAll();

      expect(mockRepo.selectAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(rows);
    });
  });
});
