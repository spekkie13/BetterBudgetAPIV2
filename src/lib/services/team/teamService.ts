// lib/services/teamService.ts
import * as teamRepo from '@/lib/db/repos/teamRepo';
import { TeamRow } from '@/app/meta/rowModel'
import { TeamInsert } from '@/app/meta/insertModel'
import {
    deleteByIdTeam, exists, getRole,
    insert, insertManyOnConflictIgnore,
    selectMembersWithUserByTeam,
    updateRole
} from "@/lib/services/membership/membershipService";

// ------------ Types returned by this service ------------
export type TeamMemberDTO = {
    userId: number;
    email: string;
    username: string;
    name: string | null;
    role: string;      // narrow to enum if you have one
    joinedAt: Date;
};

export type TeamWithMembersDTO = {
    team: { id: number; name: string; createdAt: Date };
    members: TeamMemberDTO[];
};

// ------------ Create ------------
export async function createTeam(data: { name: string; ownerUserId?: number }): Promise<TeamRow> {
    const teamValues: TeamInsert = {
        name: data.name,
        createdAt: new Date(),
    };
    const newTeam = await teamRepo.insert(teamValues);

    if (data.ownerUserId) {
        await insert({
            userId: data.ownerUserId,
            teamId: newTeam.id,
            role: 'owner',
            joinedAt: new Date(),
        });
    }
    return newTeam;
}

// ------------ Reads ------------
export async function getTeams() {
    return teamRepo.selectAll();
}

export async function getTeamsForUser(userId: number) {
    return teamRepo.selectAllByUser(userId);
}

/**
 * Returns team + member list (users + role).
 * Uses repo calls only; no direct DB in service.
 */
export async function getTeamWithMembers(teamId: number): Promise<TeamWithMembersDTO | null> {
    const team = await teamRepo.selectById(teamId); // expected: { id, name, createdAt } | null
    if (!team) return null;

    const members = await selectMembersWithUserByTeam(teamId);
    return { team, members };
}

// Back-compat: keep old name/signature
export async function getTeamById(teamId: number) {
    return getTeamWithMembers(teamId);
}

// ------------ Membership management ------------
export async function addUserToTeam(params: { teamId: number; userId: number; role?: string }) {
    const row = await insert({
        teamId: params.teamId,
        userId: params.userId,
        role: params.role ?? 'member',
        joinedAt: new Date(),
    });
    // expected: returns inserted row or null if conflict ignored
    return row ?? null;
}

export async function removeUserFromTeam(params: { teamId: number; userId: number }) {
    await deleteByIdTeam(params.teamId, params.userId);
    // expected: void (or boolean if you prefer)
}

export async function changeMemberRole(params: { teamId: number; userId: number; role: string }) {
    const row = await updateRole(params.teamId, params.userId, params.role);
    // expected: returns updated row or null if not found
    return row ?? null;
}

export async function addUsersToTeam(params: { teamId: number; userIds: number[]; role?: string }) {
    if (!params.userIds.length) return [];
    return insertManyOnConflictIgnore(
        params.userIds.map((uid) => ({
            teamId: params.teamId,
            userId: uid,
            role: params.role ?? 'member',
            joinedAt: new Date(),
        }))
    );
    // expected: returns array of inserted rows (existing duplicates ignored)
}

// ------------ Update / Delete team ------------
export async function updateTeam(data: { id: number; name?: string }) {
    const patch: Partial<TeamInsert> = {};
    if (data.name !== undefined) patch.name = data.name;

    if (Object.keys(patch).length === 0) {
        // no-op: return current state for convenience (or null if not found)
        return teamRepo.selectById(data.id);
    }
    return teamRepo.updateById(data.id, patch);
    // expected: returns updated TeamRow | null
}

export async function deleteTeam(teamId: number) {
    await teamRepo.deleteById(teamId);
    // memberships should cascade if defined in schema
}

// ------------ Guards (handy in API routes) ------------
export async function assertUserInTeam(userId: number, teamId: number) {
    const userExists = await exists(userId, teamId);
    // expected: boolean
    if (!userExists) throw new Error('Forbidden: user is not a member of this team');
}

export async function assertUserHasRole(userId: number, teamId: number, roles: string[] = ['owner', 'admin']) {
    const role = await getRole(userId, teamId); // expected: string | null
    if (!role || !roles.includes(role)) throw new Error('Forbidden: insufficient role');
}
