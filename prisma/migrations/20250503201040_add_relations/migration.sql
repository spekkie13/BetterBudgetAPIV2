/*
  Warnings:

  - You are about to drop the column `CategoryId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `CategoryId` on the `PeriodBudget` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `PeriodBudget` table. All the data in the column will be lost.
  - You are about to drop the column `BudgetId` on the `RecentPeriodResult` table. All the data in the column will be lost.
  - You are about to drop the column `CategoryId` on the `RecentPeriodResult` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `RecentPeriodResult` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `UserPreference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "CategoryId",
DROP COLUMN "UserId",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "PeriodBudget" DROP COLUMN "CategoryId",
DROP COLUMN "UserId",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "RecentPeriodResult" DROP COLUMN "BudgetId",
DROP COLUMN "CategoryId",
DROP COLUMN "UserId",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "UserId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodBudget" ADD CONSTRAINT "PeriodBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodBudget" ADD CONSTRAINT "PeriodBudget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentPeriodResult" ADD CONSTRAINT "RecentPeriodResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentPeriodResult" ADD CONSTRAINT "RecentPeriodResult_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
