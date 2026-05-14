-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN "topicId" TEXT;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "EssayTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
