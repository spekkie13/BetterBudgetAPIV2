import { describe, it, expect } from 'vitest';
import { Team } from '@/models/team';

describe('Team', () => {
  describe('create', () => {
    it('maps all fields from the data object', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const team = Team.create({ id: 1, name: 'Budget Squad', createdAt: date });

      expect(team.id).toBe(1);
      expect(team.name).toBe('Budget Squad');
      expect(team.createdAt).toBe(date);
    });

    it('falls back to a new Date when createdAt is not provided', () => {
      const before = new Date();
      const team = Team.create({ id: 2, name: 'No Date' });
      const after = new Date();

      expect(team.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(team.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('empty', () => {
    it('returns a Team with zeroed/empty fields', () => {
      const team = Team.empty();
      expect(team.id).toBe(0);
      expect(team.name).toBe('');
      expect(team.createdAt).toBeInstanceOf(Date);
    });
  });
});
