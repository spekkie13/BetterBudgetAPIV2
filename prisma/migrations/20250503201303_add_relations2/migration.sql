-- AlterTable
ALTER TABLE "Category" ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Category_id_key" CASCADE;

-- AlterTable
ALTER TABLE "DateObj" ADD CONSTRAINT "DateObj_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "DateObj_id_key" CASCADE;

-- AlterTable
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Expense_id_key" CASCADE;

-- AlterTable
ALTER TABLE "PeriodBudget" ADD CONSTRAINT "PeriodBudget_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "PeriodBudget_id_key" CASCADE;

-- AlterTable
ALTER TABLE "RecentPeriodResult" ADD CONSTRAINT "RecentPeriodResult_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "RecentPeriodResult_id_key" CASCADE;

-- AlterTable
ALTER TABLE "Team" ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Team_id_key" CASCADE;

-- AlterTable
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "User_id_key" CASCADE;

-- AlterTable
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "UserPreference_id_key" CASCADE;
