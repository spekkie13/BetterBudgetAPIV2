import {AccountPatch} from "@/app/meta/patchModel";

export type CreateAccountInput = {
    teamId: number;
    name: string;
    type: string;                                               // 'bank' | 'cash' | 'credit' | ...
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD';       // optional; DB default is 'EUR'
};

export type UpdateAccountInput = {
    teamId: number;
    id: number;
    patch: AccountPatch;
};

export type CreateBudgetInput = {
    teamId: number;
    categoryId: number;
    periodMonth: string;
    amountCents: number;
    rollover: boolean;
}
