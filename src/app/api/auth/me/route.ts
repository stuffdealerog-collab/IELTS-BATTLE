import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null }, { status: 200 })

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

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
    },
  })
}
