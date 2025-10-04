import {AccountInsert, BudgetInsert} from "@/app/meta/insertModel";

export type AccountPatch = Partial<Pick<AccountInsert, 'name' | 'type' | 'currency' | 'isArchived'>>;
export type BudgetPatch = Partial<Pick<BudgetInsert, 'categoryId' | 'periodMonth' | 'amountCents' | 'rollover'>>;
