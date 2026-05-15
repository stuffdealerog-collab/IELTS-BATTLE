-- AlterTable: add role to TelegramUser
ALTER TABLE "TelegramUser" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'STUDENT';

-- AlterTable: add AI detection fields to Essay
ALTER TABLE "Essay" ADD COLUMN "aiScore" DOUBLE PRECISION;
ALTER TABLE "Essay" ADD COLUMN "aiVerdict" TEXT;
ALTER TABLE "Essay" ADD COLUMN "aiFlags" TEXT;

-- AlterTable: add AI fields to BattleParticipant
ALTER TABLE "BattleParticipant" ADD COLUMN "aiScore" DOUBLE PRECISION;
ALTER TABLE "BattleParticipant" ADD COLUMN "aiVerdict" TEXT;

-- AlterTable: add enhanced lesson fields to LessonStep
ALTER TABLE "LessonStep" ADD COLUMN "vocabBank" TEXT;
ALTER TABLE "LessonStep" ADD COLUMN "grammarTip" TEXT;
ALTER TABLE "LessonStep" ADD COLUMN "modelAnswer" TEXT;

-- CreateTable: Classroom
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClassroomMember
CREATE TABLE "ClassroomMember" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TeacherNote
CREATE TABLE "TeacherNote" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "essayId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");
CREATE INDEX "Classroom_teacherId_idx" ON "Classroom"("teacherId");
CREATE UNIQUE INDEX "ClassroomMember_classroomId_userId_key" ON "ClassroomMember"("classroomId", "userId");
CREATE INDEX "ClassroomMember_userId_idx" ON "ClassroomMember"("userId");
CREATE INDEX "TelegramUser_role_idx" ON "TelegramUser"("role");

-- AddForeignKey: Classroom → TelegramUser
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: ClassroomMember → Classroom
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ClassroomMember → TelegramUser
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: TeacherNote → TelegramUser
ALTER TABLE "TeacherNote" ADD CONSTRAINT "TeacherNote_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: TeacherNote → Essay
ALTER TABLE "TeacherNote" ADD CONSTRAINT "TeacherNote_essayId_fkey"
  FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
