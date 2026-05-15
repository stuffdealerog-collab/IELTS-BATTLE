import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { essayId, note } = await req.json()
  if (!note?.trim()) return NextResponse.json({ error: 'Note required' }, { status: 400 })

  // Verify teacher owns this classroom
  const classroom = await prisma.classroom.findUnique({ where: { id, teacherId: session.userId } })
  if (!classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const created = await prisma.teacherNote.create({
    data: {
      teacherId: session.userId,
      essayId: essayId ?? null,
      note: note.trim(),
    },
  })

  return NextResponse.json({ note: created }, { status: 201 })
}
