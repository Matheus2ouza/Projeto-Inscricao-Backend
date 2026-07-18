/*
  Warnings:

  - You are about to drop the column `regionId` on the `accounts` table. All the data in the column will be lost.
  - Made the column `locality_id` on table `account_participants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "account_participants" DROP CONSTRAINT "account_participants_locality_id_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_regionId_fkey";

-- AlterTable
ALTER TABLE "account_participants" ALTER COLUMN "locality_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "regionId",
ADD COLUMN     "region_id" TEXT;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participants" ADD CONSTRAINT "account_participants_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
