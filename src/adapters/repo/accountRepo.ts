import { db } from '@/db/client';
import { and, eq } from 'drizzle-orm';
import { AccountInsert } from '@/app/meta/insertModel'
import { AccountRow } from '@/app/meta/rowModel'
import {accounts} from "@/db/schema/accounts";
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeAccountRepo() {
    return makeTeamScopedRepo(db, accounts, accounts.id, accounts.teamId);
}
