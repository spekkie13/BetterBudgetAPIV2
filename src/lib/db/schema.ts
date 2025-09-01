import {
    pgTable, serial, integer, varchar, text, timestamp, boolean, date, pgEnum,
    jsonb, primaryKey, uniqueIndex, index, bigserial, bigint, AnyPgColumn
} from 'drizzle-orm/pg-core';

// ---------- Enums ----------
export const categoryType = pgEnum('category_type', ['expense','income','transfer']);
export const currencyCode = pgEnum('currency_code', ['USD','EUR','GBP','JPY','CAD','AUD','NZD']);
export const periodStart = pgEnum('period_start', ['calendar_month', 'anchored_month'])

// ---------- Teams & Users ----------
export const teams = pgTable('team', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const team_settings = pgTable('team_settings', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    periodStart: periodStart('period_start').notNull().default('calendar_month'),
    anchor_day: integer('anchor_day').notNull().default(1),
    anchor_timezone: varchar('anchor_timezone').notNull().default('Europe/Amsterdam')
})

export const users = pgTable('app_user', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Many-to-many membership (roles optional)
export const memberships = pgTable('membership', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).default('member').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.userId, t.teamId] })
]);

// ---------- Accounts ----------
export const accounts = pgTable('account', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'bank' | 'cash' | 'credit' | ...
    currency: currencyCode('currency').notNull().default('EUR'),
    isArchived: boolean('is_archived').notNull().default(false),
}, (t) => [
    uniqueIndex('ux_account_team_name').on(t.teamId, t.name),
    index('ix_account_team').on(t.teamId),
]);

// ---------- Categories ----------
export const categories = pgTable('category', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: categoryType('type').notNull().default('expense'),
    color: varchar('color', { length: 32 }).notNull(),
    icon: varchar('icon', { length: 64 }).notNull(),
    parentId: integer('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
});

// ---------- Transactions (ledger) ----------
export const transactions = pgTable('txn', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    // signed amount in minor units (e.g., cents). expense < 0, income > 0
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    currency: currencyCode('currency').notNull(), // mirror account.currency at insert time
    postedAt: timestamp('posted_at', { withTimezone: true }).notNull(), // the date user cares about
    payee: varchar('payee', { length: 255 }),
    memo: text('memo'),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }), // null for transfers or use splits
    isTransfer: boolean('is_transfer').notNull().default(false),
    transferGroupId: bigint('transfer_group_id', { mode: 'number' }), // same id on both legs
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete
}, (t) => [
    index('ix_txn_team_posted').on(t.teamId, t.postedAt),
    index('ix_txn_team_category').on(t.teamId, t.categoryId),
    index('ix_txn_team_account').on(t.teamId, t.accountId),
    index('ix_txn_transfer_group').on(t.transferGroupId),
]);

// ---------- Splits (optional, when splitting one payment across categories) ----------
export const transactionSplits = pgTable('txn_split', {
    id: serial('id').primaryKey(),
    txnId: bigint('txn_id', { mode: 'number' }).notNull().references(() => transactions.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(), // signed, typically matches txn sign
}, (t) => [
    index('ix_split_txn').on(t.txnId),
]);

// ---------- Budgets (monthly) ----------
export const budgets = pgTable('budget', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    periodMonth: date('period_month').notNull(), // first day of month, e.g., 2025-08-01
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    rollover: boolean('rollover').notNull().default(false),
}, (t) => [
    uniqueIndex('ux_budget_team_cat_month').on(t.teamId, t.categoryId, t.periodMonth),
    index('ix_budget_team_month').on(t.teamId, t.periodMonth),
]);

// ---------- Recurring rules ----------
export const recurringRules = pgTable('recurring_rule', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    templateCategoryId: integer('template_category_id').references(() => categories.id, { onDelete: 'set null' }),
    templatePayee: varchar('template_payee', { length: 255 }),
    templateMemo: text('template_memo'),
    templateAmountCents: bigint('template_amount_cents', { mode: 'number' }).notNull(), // signed
    rrule: text('rrule').notNull(),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
});

// ---------- User settings ----------
export const userSettings = pgTable('user_setting', {
    userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    theme: varchar('theme', { length: 20 }).default('system'),
    textSize: varchar('text_size', { length: 10 }).default('M'),
    preferences: jsonb('preferences').$type<Record<string, unknown>>(), // extras
});
