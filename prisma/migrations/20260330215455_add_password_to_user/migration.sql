-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- Remove the default after backfilling
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
