-- Add gamification fields to TelegramUser
ALTER TABLE "TelegramUser" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TelegramUser" ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TelegramUser" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);
ALTER TABLE "TelegramUser" ADD COLUMN IF NOT EXISTS "currentBand" DOUBLE PRECISION;

-- Add bot battle fields to Battle
ALTER TABLE "Battle" ADD COLUMN IF NOT EXISTS "isBotBattle" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Battle" ADD COLUMN IF NOT EXISTS "botBand" DOUBLE PRECISION;
ALTER TABLE "Battle" ADD COLUMN IF NOT EXISTS "botEssay" TEXT;
ALTER TABLE "Battle" ADD COLUMN IF NOT EXISTS "botScore" DOUBLE PRECISION;

-- Create DailyChallenge table
CREATE TABLE IF NOT EXISTS "DailyChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "xpReward" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DailyChallenge_userId_date_key" UNIQUE ("userId", "date")
);
CREATE INDEX IF NOT EXISTS "DailyChallenge_userId_idx" ON "DailyChallenge"("userId");
