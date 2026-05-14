import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let progress = null
  if (session) {
    progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.userId, lessonId: id } },
    })
  }

  return NextResponse.json({ lesson, progress })
}
