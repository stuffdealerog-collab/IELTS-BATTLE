import { prisma } from '@/lib/prisma'

export const XP = {
  ESSAY_SUBMITTED: 30,
  BATTLE_WIN: 100,
  BATTLE_LOSS: 20,
  LESSON_STEP: 15,
  LESSON_COMPLETE: 80,
  DAILY_CHALLENGE: 50,
  STREAK_BONUS: 10, // per streak day above 1
} as const

export function levelFromXp(xp: number): number {
  // Level = sqrt(xp / 100) + 1, capped at 50
  return Math.min(50, Math.floor(Math.sqrt(xp / 100)) + 1)
}

export function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = levelFromXp(xp)
  const needed = level * level * 100
  const prev = (level - 1) * (level - 1) * 100
  return { current: xp - prev, needed: needed - prev, level }
}

export async function awardXp(userId: string, amount: number): Promise<void> {
  await prisma.telegramUser.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  })
}

export async function updateStreak(userId: string): Promise<number> {
  const user = await prisma.telegramUser.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveAt: true },
  })
  if (!user) return 0

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const lastStr = user.lastActiveAt?.toISOString().slice(0, 10)

  if (lastStr === todayStr) return user.streak // already counted today

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak = lastStr === yesterdayStr ? user.streak + 1 : 1
  const xpBonus = XP.STREAK_BONUS * Math.min(newStreak, 30) // cap at 30 days bonus

  await prisma.telegramUser.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastActiveAt: now,
      xp: { increment: xpBonus },
    },
  })

  return newStreak
}
