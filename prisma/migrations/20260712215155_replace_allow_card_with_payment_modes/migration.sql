/*
  Warnings:

  - You are about to drop the column `allow_card` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `events` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CARTA0', 'PIX', 'BOLETO');

-- AlterTable
ALTER TABLE "events" DROP COLUMN "allow_card",
DROP COLUMN "logoUrl",
ADD COLUMN     "allowed_payment_modes" "PaymentMode"[] DEFAULT ARRAY['PIX']::"PaymentMode"[],
ADD COLUMN     "logo_url" TEXT;
