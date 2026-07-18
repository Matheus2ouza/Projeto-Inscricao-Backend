/*
  Warnings:

  - The values [CARTA0] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CARTAO', 'PIX', 'BOLETO');
ALTER TABLE "public"."events" ALTER COLUMN "allowed_payment_modes" DROP DEFAULT;
ALTER TABLE "events" ALTER COLUMN "allowed_payment_modes" TYPE "PaymentMode_new"[] USING ("allowed_payment_modes"::text::"PaymentMode_new"[]);
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "public"."PaymentMode_old";
ALTER TABLE "events" ALTER COLUMN "allowed_payment_modes" SET DEFAULT ARRAY['PIX']::"PaymentMode"[];
COMMIT;
