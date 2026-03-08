import { describe, it, expect } from 'vitest';
import { User } from '@/models/user';

describe('User', () => {
  describe('create', () => {
    it('maps all fields from the data object', () => {
      const data = {
        id: 1,
        token: 'tok-abc',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      };
      const user = User.create(data);

      expect(user.id).toBe(1);
      expect(user.token).toBe('tok-abc');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBe('2024-01-01T00:00:00Z');
    });

    it('converts a Date object to an ISO string', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const user = User.create({
        id: 2,
        token: 'tok',
        email: 'a@b.com',
        username: 'u',
        name: 'N',
        createdAt: date,
      });
      expect(user.createdAt).toBe(date.toISOString());
    });

    it('keeps a string createdAt as-is', () => {
      const user = User.create({
        id: 3,
        token: 't',
        email: 'x@y.com',
        username: 'x',
        name: 'X',
        createdAt: '2024-01-01',
      });
      expect(user.createdAt).toBe('2024-01-01');
    });
  });

  describe('empty', () => {
    it('returns a User with zeroed/empty fields', () => {
      const user = User.empty();
      expect(user.id).toBe(0);
      expect(user.token).toBe('');
      expect(user.email).toBe('');
      expect(user.username).toBe('');
      expect(user.name).toBe('');
      expect(user.createdAt).toBe('');
    });
  });
});
