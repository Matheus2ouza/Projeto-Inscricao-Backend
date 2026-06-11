/*
  Warnings:

  - Made the column `description` on table `cash_register_entries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cash_register_entries" ALTER COLUMN "description" SET NOT NULL;
