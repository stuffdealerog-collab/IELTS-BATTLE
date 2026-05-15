import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: session.userId },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ classrooms })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  // Generate unique 6-char code
  let code = generateCode()
  let exists = await prisma.classroom.findUnique({ where: { code } })
  while (exists) {
    code = generateCode()
    exists = await prisma.classroom.findUnique({ where: { code } })
  }

  const classroom = await prisma.classroom.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      code,
      teacherId: session.userId,
    },
  })

  return NextResponse.json({ classroom }, { status: 201 })
}
