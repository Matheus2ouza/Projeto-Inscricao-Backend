-- CreateTable
CREATE TABLE "event_slugs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_slugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_slugs_slug_key" ON "event_slugs"("slug");

-- CreateIndex
CREATE INDEX "event_slugs_eventId_idx" ON "event_slugs"("eventId");

-- AddForeignKey
ALTER TABLE "event_slugs" ADD CONSTRAINT "event_slugs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
