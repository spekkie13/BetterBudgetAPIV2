import { describe, it, expect } from 'vitest';
import { UserWithTeam } from '@/models/userWithTeams';
import { User } from '@/models/user';
import { Team } from '@/models/team';

describe('UserWithTeam', () => {
  describe('constructor', () => {
    it('stores the user and team', () => {
      const user = User.create({ id: 1, token: 't', email: 'a@b.com', username: 'u', name: 'N', createdAt: '' });
      const team = Team.create({ id: 10, name: 'My Team' });
      const uwt = new UserWithTeam(user, team);

      expect(uwt.user).toBe(user);
      expect(uwt.team).toBe(team);
    });
  });

  describe('empty', () => {
    it('returns a UserWithTeam with empty user and team', () => {
      const uwt = UserWithTeam.empty();

      expect(uwt.user.id).toBe(0);
      expect(uwt.user.email).toBe('');
      expect(uwt.team.id).toBe(0);
      expect(uwt.team.name).toBe('');
    });
  });
});
