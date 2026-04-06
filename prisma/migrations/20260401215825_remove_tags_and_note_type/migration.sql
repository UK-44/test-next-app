/*
  Warnings:

  - You are about to drop the column `isOrganized` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `noteType` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `NoteTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NoteTag" DROP CONSTRAINT "NoteTag_noteId_fkey";

-- DropForeignKey
ALTER TABLE "NoteTag" DROP CONSTRAINT "NoteTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "isOrganized",
DROP COLUMN "noteType";

-- DropTable
DROP TABLE "NoteTag";

-- DropTable
DROP TABLE "Tag";

-- DropEnum
DROP TYPE "NoteType";
