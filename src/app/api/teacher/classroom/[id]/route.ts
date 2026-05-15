import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const classroom = await prisma.classroom.findUnique({
    where: { id, teacherId: session.userId },
    include: {
      members: {
        include: {
          user: {
            include: {
              essays: {
                where: { isDraft: false },
                include: { feedback: true },
                orderBy: { submittedAt: 'desc' },
              },
              lessonProgress: {
                include: { lesson: true },
              },
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })

  if (!classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const students = classroom.members.map((m) => {
    const essays = m.user.essays
    const withFeedback = essays.filter((e) => e.feedback)
    const avgBand =
      withFeedback.length > 0
        ? withFeedback.reduce((s, e) => s + (e.feedback?.overallBand ?? 0), 0) / withFeedback.length
        : null
    const aiFlags = essays.filter(
      (e) => e.aiVerdict === 'LIKELY_AI' || e.aiVerdict === 'UNCERTAIN'
    ).length

    return {
      id: m.user.id,
      firstName: m.user.firstName,
      username: m.user.username,
      photoUrl: m.user.photoUrl,
      rating: m.user.rating,
      joinedAt: m.joinedAt,
      essayCount: essays.length,
      avgBand,
      aiFlags,
      lessonProgress: m.user.lessonProgress.map((p) => ({
        lessonTitle: p.lesson.title,
        completed: p.completed,
        currentStep: p.currentStep,
      })),
    }
  })

  return NextResponse.json({
    classroom: {
      id: classroom.id,
      name: classroom.name,
      code: classroom.code,
      description: classroom.description,
      createdAt: classroom.createdAt,
    },
    students,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const classroom = await prisma.classroom.findUnique({ where: { id } })
  if (!classroom || classroom.teacherId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.classroom.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
