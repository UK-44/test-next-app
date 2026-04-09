-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "actionStatus" "ActionStatus";
