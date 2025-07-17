import { pgTable, serial, varchar, integer, numeric, timestamp, text, real, primaryKey } from 'drizzle-orm/pg-core';

// ---------------------- User Table ----------------------
export const users = pgTable('User', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    teamId: integer('teamId'),
});

// ---------------------- Team Table ----------------------
export const teams = pgTable('Team', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
});

// ---------------------- Category Table ----------------------
export const categories = pgTable('Category', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 255 }).notNull(),
    userId: integer('userId').notNull(),
});

// ---------------------- Expense Table ----------------------
export const expenses = pgTable('Expense', {
    id: serial('id').primaryKey(),
    description: text('description').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    isRecurring: integer('isRecurring').notNull(),
    userId: integer('userId').notNull(),
    categoryId: integer('categoryId').notNull(),
});

// ---------------------- Income Table ----------------------
export const incomes = pgTable('Income', {
    id: serial('id').primaryKey(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    userId: integer('userId').notNull(),
});

// ---------------------- Period Table ----------------------
export const periods = pgTable('Period', {
    id: serial('id').primaryKey(),
    startDate: timestamp('startDate', { withTimezone: true }).notNull(),
    endDate: timestamp('endDate', { withTimezone: true }).notNull(),
    startingAmount: numeric('startingAmount', { precision: 10, scale: 2 }).notNull(),
});

// ---------------------- Budget Table ----------------------
export const budgets = pgTable('Budget', {
    id: serial('id').primaryKey(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    userId: integer('userId').notNull(),
    categoryId: integer('categoryId').notNull(),
    periodId: integer('periodId').notNull(),
});

// ---------------------- Result Table ----------------------
export const results = pgTable('Result', {
    id: serial('id').primaryKey(),
    totalSpent: numeric('totalSpent', { precision: 10, scale: 2 }).notNull(),
    percentageSpent: numeric('percentageSpent', { precision: 7, scale: 2 }).notNull(),
    userId: integer('userId').notNull(),
    categoryId: integer('categoryId').notNull(),
    periodId: integer('periodId').notNull(),
});

// ---------------------- User Preference Table ----------------------
export const userPreferences = pgTable('UserPreference', {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull(),
    stringValue: varchar('stringValue', { length: 255 }),
    numberValue: real('numberValue'),
    dateValue: timestamp('dateValue', { withTimezone: true }),
    userId: integer('userId').notNull(),
}, (table) => [
    primaryKey({ columns: [table.name, table.userId]})
]);
