import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { levelFromXp, xpToNextLevel } from '@/lib/gamification'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null }, { status: 200 })

  const user = await prisma.telegramUser.findUnique({
    where: { id: session.userId },
    include: {
      classroomMemberships: {
        include: {
          classroom: {
            include: {
              teacher: { select: { firstName: true, username: true } },
              _count: { select: { members: true } },
            },
          },
        },
        take: 1,
        orderBy: { joinedAt: 'desc' },
      },
    },
  })
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

  const membership = user.classroomMemberships[0]
  const classroom = membership
    ? {
        id: membership.classroom.id,
        name: membership.classroom.name,
        code: membership.classroom.code,
        teacherName:
          membership.classroom.teacher.firstName ??
          membership.classroom.teacher.username ??
          'Teacher',
        memberCount: membership.classroom._count.members,
        joinedAt: membership.joinedAt.toISOString(),
      }
    : null

  const xpInfo = xpToNextLevel(user.xp)
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayChallenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: user.id, date: todayStr } },
    select: { completed: true },
  })

  return NextResponse.json({
    user: {
      id: user.id,
      telegramId: String(user.telegramId),
      username: user.username,
      firstName: user.firstName,
      photoUrl: user.photoUrl,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      role: user.role,
      xp: user.xp,
      level: xpInfo.level,
      xpProgress: xpInfo.current,
      xpNeeded: xpInfo.needed,
      streak: user.streak,
      currentBand: user.currentBand,
      dailyDone: todayChallenge?.completed ?? false,
      classroom,
    },
  })
}
