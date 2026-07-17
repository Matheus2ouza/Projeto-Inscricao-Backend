-- AlterTable
ALTER TABLE "account_participants" ADD COLUMN     "locality_id" TEXT;

-- CreateTable
CREATE TABLE "account_localities" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "locality_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_localities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "localities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_localities_account_id_locality_id_key" ON "account_localities"("account_id", "locality_id");

-- CreateIndex
CREATE UNIQUE INDEX "localities_name_region_id_key" ON "localities"("name", "region_id");

-- CreateIndex
CREATE INDEX "account_participants_locality_id_idx" ON "account_participants"("locality_id");

-- AddForeignKey
ALTER TABLE "account_localities" ADD CONSTRAINT "account_localities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_localities" ADD CONSTRAINT "account_localities_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participants" ADD CONSTRAINT "account_participants_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localities" ADD CONSTRAINT "localities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
