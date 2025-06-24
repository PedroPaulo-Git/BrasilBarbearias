/*
  Warnings:

  - Made the column `name` on table `owners` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "owners" ALTER COLUMN "name" SET NOT NULL;
