import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/db/client';
import { makeChain } from '../helpers/mockChain';
import { UserAlreadyExistsError } from '@/models/errors';

vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

// Import after mock is registered
const { UserRepository } = await import('@/repository/userRepo');

const repo = new UserRepository();

const mockUser = {
  id: 1,
  token: 'supabase-uid-abc',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
};

const mockUserRow = {
  id: 1,
  supabaseUid: 'supabase-uid-abc',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
};

const mockTeamRow = { id: 10, name: 'My Team' };

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('selectByToken', () => {
    it('returns null when no user is found', async () => {
      vi.mocked(db.select)
        .mockReturnValueOnce(makeChain([]) as any);

      const result = await repo.selectByToken('unknown-token');

      expect(result).toBeNull();
    });

    it('returns user with teams when found', async () => {
      const userChain = makeChain([mockUser]);
      const teamsChain = makeChain([mockTeamRow]);

      vi.mocked(db.select)
        .mockReturnValueOnce(userChain as any)
        .mockReturnValueOnce(teamsChain as any);

      const result = await repo.selectByToken('supabase-uid-abc');

      expect(result).toEqual({ ...mockUser, teams: [mockTeamRow] });
    });

    it('returns user with empty teams array when user has no teams', async () => {
      const userChain = makeChain([mockUser]);
      const teamsChain = makeChain([]);

      vi.mocked(db.select)
        .mockReturnValueOnce(userChain as any)
        .mockReturnValueOnce(teamsChain as any);

      const result = await repo.selectByToken('supabase-uid-abc');

      expect(result).toEqual({ ...mockUser, teams: [] });
    });
  });

  describe('create', () => {
    it('inserts a new user and returns the row', async () => {
      vi.mocked(db.insert).mockReturnValue(makeChain([mockUserRow]) as any);

      const input = {
        supabaseUid: 'supabase-uid-abc',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      };

      const result = await repo.create(input);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserRow);
    });
  });

  describe('update', () => {
    it('updates a user and returns the updated row', async () => {
      const updatedRow = { ...mockUserRow, name: 'Updated Name' };
      vi.mocked(db.update).mockReturnValue(makeChain([updatedRow]) as any);

      const result = await repo.update(1, { name: 'Updated Name' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedRow);
    });
  });

  describe('delete', () => {
    it('deletes a user without error', async () => {
      vi.mocked(db.delete).mockReturnValue(makeChain([]) as any);

      await expect(repo.delete(1)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('provision', () => {
    const input = { supabaseUid: 'supabase-uid-abc', email: 'test@example.com', username: 'testuser', name: 'Test User' };

    it('runs a transaction inserting user, team, and membership and returns both rows', async () => {
      vi.mocked(db.transaction).mockImplementation(async (cb: any) => {
        const tx = {
          insert: vi.fn()
            .mockReturnValueOnce(makeChain([mockUserRow]))
            .mockReturnValueOnce(makeChain([mockTeamRow]))
            .mockReturnValueOnce(makeChain([])),
        };
        return cb(tx);
      });

      const result = await repo.provision(input);

      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(result.userRow).toEqual(mockUserRow);
      expect(result.teamRow).toEqual(mockTeamRow);
    });

    it('throws UserAlreadyExistsError on PG unique constraint violation', async () => {
      vi.mocked(db.transaction).mockRejectedValue({ code: '23505' });

      await expect(repo.provision(input)).rejects.toBeInstanceOf(UserAlreadyExistsError);
    });

    it('rethrows unexpected errors from the transaction', async () => {
      const boom = new Error('connection refused');
      vi.mocked(db.transaction).mockRejectedValue(boom);

      await expect(repo.provision(input)).rejects.toBe(boom);
    });
  });
});
