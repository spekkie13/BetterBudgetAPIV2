import { db } from '@/db/client';
import { makeTeamScopedRepo } from "@/adapters/repo/factory/makeTeamScopedRepo";
import { recurring_rules } from "@/db/schema";

export function makeRecurringRulesRepo() {
    return makeTeamScopedRepo(db, recurring_rules, recurring_rules.id, recurring_rules.teamId);
}
