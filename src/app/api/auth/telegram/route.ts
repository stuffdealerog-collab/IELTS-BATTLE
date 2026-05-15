import { NextResponse } from 'next/server'
import { validateInitData } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'
import { signSession, setSessionCookie } from '@/lib/jwt'

export async function POST(req: Request) {
  const { initData } = await req.json()
  if (!initData) return NextResponse.json({ error: 'Missing initData' }, { status: 400 })

  const tgUser = validateInitData(initData)
  if (!tgUser) return NextResponse.json({ error: 'Invalid initData' }, { status: 401 })

  const user = await prisma.telegramUser.upsert({
    where: { telegramId: BigInt(tgUser.id) },
    create: {
      telegramId: BigInt(tgUser.id),
      username: tgUser.username,
      firstName: tgUser.firstName,
      lastName: tgUser.lastName,
      photoUrl: tgUser.photoUrl,
      languageCode: tgUser.languageCode,
    },
    update: {
      username: tgUser.username,
      firstName: tgUser.firstName,
      lastName: tgUser.lastName,
      photoUrl: tgUser.photoUrl,
      languageCode: tgUser.languageCode,
    },
  })

  const token = await signSession({ userId: user.id, telegramId: String(user.telegramId) })
  await setSessionCookie(token)

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
