/*
  Warnings:

  - Added the required column `uf` to the `localities` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UF" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- AlterTable
ALTER TABLE "localities" ADD COLUMN     "uf" "UF" NOT NULL;
