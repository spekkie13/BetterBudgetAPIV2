import { db } from '@/db/client';
import {budgets} from "@/db/schema/budgets"
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeBudgetRepo () {
    return makeTeamScopedRepo(db, budgets, budgets.id, budgets.teamId);
}
