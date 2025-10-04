import {makeMembershipRepo} from "@/lib/db/repos/membershipRepo";

const repo = makeMembershipRepo()

export const insert          = (v: Parameters<typeof repo.create>[0]) => repo.create(v);
export const selectByIdTeam  = (teamId: number, id: number) => repo.getById(teamId, id);
export const selectAllByTeam = (teamId: number) => repo.listByTeam(teamId);
export const updateByIdTeam  = (teamId: number, id: number, p: any) => repo.updateById(teamId, id, p);
export const deleteByIdTeam  = (teamId: number, id: number) => repo.deleteById(teamId, id);
export const exists          = (teamId: number, id: number) => repo.exists(teamId, id);
export const insertManyOnConflictIgnore = (values: Array<{ userId: number; teamId: number; role: string; joinedAt: Date; }>) => repo.insertManyOnConflictIgnore(values);
export const updateRole = (teamId: number, userId: number, role: string) => repo.updateRole(teamId, userId, role);
export const getRole = (teamId: number, userId: number) => repo.getRole(teamId, userId);
export const selectMembersWithUserByTeam = (teamId: number) => repo.selectMembersWithUserByTeam(teamId);
