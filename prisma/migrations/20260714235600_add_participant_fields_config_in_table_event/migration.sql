-- AlterTable
ALTER TABLE "events" ADD COLUMN     "participant_fields_config" JSONB NOT NULL DEFAULT '{}';
