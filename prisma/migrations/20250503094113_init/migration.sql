-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "TeamId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "StringValue" TEXT NOT NULL,
    "NumberValue" INTEGER NOT NULL,
    "DateValue" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Color" TEXT NOT NULL,
    "Icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Amount" DECIMAL(65,30) NOT NULL,
    "Description" TEXT NOT NULL,
    "IsRecurring" BOOLEAN NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PeriodBudget" (
    "id" SERIAL NOT NULL,
    "Budget" DECIMAL(65,30) NOT NULL,
    "Month" INTEGER NOT NULL,
    "Year" INTEGER NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "RecentPeriodResult" (
    "id" SERIAL NOT NULL,
    "Spent" DECIMAL(65,30) NOT NULL,
    "BudgetId" INTEGER NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DateObj" (
    "id" SERIAL NOT NULL,
    "Year" INTEGER NOT NULL,
    "Month" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_id_key" ON "UserPreference"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_key" ON "Category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_id_key" ON "Expense"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodBudget_id_key" ON "PeriodBudget"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RecentPeriodResult_id_key" ON "RecentPeriodResult"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DateObj_id_key" ON "DateObj"("id");
