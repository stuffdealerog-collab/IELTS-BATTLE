import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.classroomMember.findFirst({
    where: { userId: session.userId },
    include: {
      classroom: {
        include: {
          teacher: {
            select: { firstName: true, username: true, photoUrl: true },
          },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  if (!membership) return NextResponse.json({ classroom: null, essays: [] })

  const essays = await prisma.essay.findMany({
    where: { userId: session.userId, isDraft: false },
    include: {
      topic: { select: { title: true, taskType: true } },
      feedback: {
        select: {
          taskAchievement: true,
          coherence: true,
          lexical: true,
          grammar: true,
          overallBand: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
    take: 20,
  })

  const classroom = {
    id: membership.classroom.id,
    name: membership.classroom.name,
    code: membership.classroom.code,
    description: membership.classroom.description,
    teacherName:
      membership.classroom.teacher.firstName ??
      membership.classroom.teacher.username ??
      'Teacher',
    teacherPhoto: membership.classroom.teacher.photoUrl,
    memberCount: membership.classroom._count.members,
    joinedAt: membership.joinedAt.toISOString(),
  }

  const formattedEssays = essays.map((e) => ({
    id: e.id,
    topicTitle: e.topic.title,
    taskType: e.topic.taskType,
    wordCount: e.wordCount,
    submittedAt: e.submittedAt?.toISOString() ?? null,
    aiVerdict: e.aiVerdict,
    aiScore: e.aiScore,
    band: e.feedback?.overallBand ?? null,
    taskAchievement: e.feedback?.taskAchievement ?? null,
    coherence: e.feedback?.coherence ?? null,
    lexical: e.feedback?.lexical ?? null,
    grammar: e.feedback?.grammar ?? null,
  }))

  return NextResponse.json({ classroom, essays: formattedEssays })
}
