-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "primaryChatPlatform" TEXT;

-- Backfill existing organizations to Slack for consistent legacy behavior
UPDATE "Organization" SET "primaryChatPlatform" = 'slack' WHERE "primaryChatPlatform" IS NULL;
