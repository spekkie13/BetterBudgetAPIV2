import {monthToDate} from "@/lib/shared/helpers";

export type BudgetKey = { teamId: number; categoryId: number; periodMonth: string };
export function makeBudgetKey(teamId: number, categoryId: number, month: string | Date): BudgetKey {
    return { teamId, categoryId, periodMonth: monthToDate(month) };
}

export type CategoryKey = { id: number };
export function makeCategoryKey(id: number): CategoryKey {
    return { id };
}

export type MembershipKey = { userId: number; teamId: number };
export function makeMembershipKey(userId: number, teamId: number): MembershipKey {
    return { userId, teamId };
}

export type TeamKey = { id: number };
export function makeTeamKey(id: number): TeamKey {
    return { id };
}
