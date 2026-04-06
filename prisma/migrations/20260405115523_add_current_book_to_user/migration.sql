-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentBookId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentBookId_fkey" FOREIGN KEY ("currentBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
