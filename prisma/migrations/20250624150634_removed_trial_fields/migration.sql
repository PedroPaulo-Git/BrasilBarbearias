/*
  Warnings:

  - You are about to drop the column `trialDays` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `trialEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialStart` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "trialDays";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "trialEnd",
DROP COLUMN "trialStart";
