import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/service/userService';
import type { IUserRepository } from '@/repository/interfaces/IUserRepository';

const mockRepo: IUserRepository = {
  selectByToken: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const service = new UserService(mockRepo);

const mockUserRow: any = {
  id: 1,
  supabaseUid: 'uid-abc',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  createdAt: new Date(),
};

const mockUserWithTeams: any = {
  ...mockUserRow,
  token: 'uid-abc',
  teams: [{ id: 10, name: 'My Team' }],
};

describe('UserService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getUserByToken', () => {
    it('delegates to repo.selectByToken and returns the result', async () => {
      vi.mocked(mockRepo.selectByToken).mockResolvedValue(mockUserWithTeams);

      const result = await service.getUserByToken('uid-abc');

      expect(mockRepo.selectByToken).toHaveBeenCalledWith('uid-abc');
      expect(result).toEqual(mockUserWithTeams);
    });

    it('returns null when token is not found', async () => {
      vi.mocked(mockRepo.selectByToken).mockResolvedValue(null);

      const result = await service.getUserByToken('bad-token');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('delegates to repo.create and returns the new row', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockUserRow);

      const input = { supabaseUid: 'uid-abc', email: 'test@example.com', username: 'testuser', name: 'Test User' };
      const result = await service.createUser(input);

      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockUserRow);
    });
  });

  describe('updateUser', () => {
    it('delegates to repo.update and returns the updated row', async () => {
      const updated = { ...mockUserRow, name: 'New Name' };
      vi.mocked(mockRepo.update).mockResolvedValue(updated);

      const result = await service.updateUser(1, { name: 'New Name' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteUser', () => {
    it('delegates to repo.delete', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(undefined);

      await service.deleteUser(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
