import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  const validCode = process.env.TEACHER_CODE ?? 'IELTSTEACH2024'

  if (!code || code.trim() !== validCode) {
    return NextResponse.json({ error: 'Invalid teacher code' }, { status: 403 })
  }

  const user = await prisma.telegramUser.update({
    where: { id: session.userId },
    data: { role: 'TEACHER' },
  })

  return NextResponse.json({
    user: { id: user.id, role: user.role, firstName: user.firstName },
  })
}
