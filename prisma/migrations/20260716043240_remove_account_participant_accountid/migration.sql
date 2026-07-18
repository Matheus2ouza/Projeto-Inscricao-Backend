/*
  Warnings:

  - You are about to drop the column `account_id` on the `account_participants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "account_participants" DROP CONSTRAINT "account_participants_account_id_fkey";

-- AlterTable
ALTER TABLE "account_participants" DROP COLUMN "account_id";
