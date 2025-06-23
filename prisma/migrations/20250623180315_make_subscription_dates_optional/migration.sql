/*
  Warnings:

  - You are about to drop the column `paymentEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStart` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mercadoPagoSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mercadoPagoPreferenceId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentEnd",
DROP COLUMN "paymentStart",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ALTER COLUMN "trialStart" DROP NOT NULL,
ALTER COLUMN "trialEnd" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_mercadoPagoSubscriptionId_key" ON "Subscription"("mercadoPagoSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_mercadoPagoPreferenceId_key" ON "Subscription"("mercadoPagoPreferenceId");
