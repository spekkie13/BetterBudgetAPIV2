import * as teamSvc from '@/lib/services/teamService';
import * as userSvc from '@/lib/services/userService';
import { addUserToTeam, removeUserFromTeam, changeUserRoleInTeam } from '@/lib/services/userService';

describe('team & user & membership', () => {
    it('creates team and user, links membership, changes role, and lists users', async () => {
        const team = await teamSvc.createTeam({ name: 'Alpha' });
        const user = await userSvc.createUser({ username: 'alpha', name: 'Alpha User', email: 'alpha@example.com' });

        // link
        await addUserToTeam({ userId: user.id, teamId: team.id, role: 'owner' });
        // change role
        const changed = await changeUserRoleInTeam({ userId: user.id, teamId: team.id, role: 'member' });
        expect(changed?.role).toBe('member');

        const byId = await userSvc.getUserById(user.id);
        expect(byId?.teams?.length ?? 0).toBeGreaterThan(0);

        // remove membership
        await removeUserFromTeam({ userId: user.id, teamId: team.id });
        const after = await userSvc.getUsersByTeamId(team.id);
        expect(after.length).toBe(0);
    });
});
