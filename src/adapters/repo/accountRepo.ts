import { db } from '@/db/client';
import {accounts} from "@/db/schema/accounts";
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeAccountRepo() {
    return makeTeamScopedRepo(db, accounts, accounts.id, accounts.teamId);
}
