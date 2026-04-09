/*
  Warnings:

  - Made the column `actionStatus` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill existing NULL values
UPDATE "Note" SET "actionStatus" = 'NOT_STARTED' WHERE "actionStatus" IS NULL;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "actionStatus" SET NOT NULL,
ALTER COLUMN "actionStatus" SET DEFAULT 'NOT_STARTED';
