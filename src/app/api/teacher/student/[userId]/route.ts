import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teacher = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (teacher?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params

  // Ensure the student is in at least one of this teacher's classrooms
  const membership = await prisma.classroomMember.findFirst({
    where: {
      userId,
      classroom: { teacherId: session.userId },
    },
  })
  if (!membership) return NextResponse.json({ error: 'Student not in your classroom' }, { status: 404 })

  const student = await prisma.telegramUser.findUnique({
    where: { id: userId },
    include: {
      essays: {
        where: { isDraft: false },
        include: {
          topic: true,
          feedback: true,
          teacherNotes: { include: { teacher: true } },
        },
        orderBy: { submittedAt: 'desc' },
      },
      lessonProgress: {
        include: { lesson: { include: { steps: { select: { id: true } } } }, topic: true },
      },
      participations: {
        include: { battle: { include: { topic: true } } },
        orderBy: { battle: { createdAt: 'desc' } },
        take: 20,
      },
    },
  })

  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      username: student.username,
      photoUrl: student.photoUrl,
      rating: student.rating,
      wins: student.wins,
      losses: student.losses,
      essays: student.essays.map((e) => {
        let summary: string | null = null
        let improvements: string[] = []
        if (e.feedback?.detailedFeedback) {
          try {
            const parsed = JSON.parse(e.feedback.detailedFeedback)
            summary = parsed.summary ?? null
            improvements = Array.isArray(parsed.improvements) ? parsed.improvements : []
          } catch {
            // ignore malformed
          }
        }
        return {
          id: e.id,
          topicTitle: e.topic.title,
          topicType: e.topic.taskType,
          wordCount: e.wordCount,
          submittedAt: e.submittedAt,
          overallBand: e.feedback?.overallBand ?? null,
          taskAchievement: e.feedback?.taskAchievement ?? null,
          coherence: e.feedback?.coherence ?? null,
          lexical: e.feedback?.lexical ?? null,
          grammar: e.feedback?.grammar ?? null,
          summary,
          improvements,
          aiScore: e.aiScore,
          aiVerdict: e.aiVerdict,
          aiFlags: e.aiFlags ? JSON.parse(e.aiFlags) : [],
          content: e.content,
          teacherNotes: e.teacherNotes.map((n) => ({
            id: n.id,
            note: n.note,
            teacherName: n.teacher.firstName ?? n.teacher.username,
            createdAt: n.createdAt,
          })),
        }
      }),
      lessonProgress: student.lessonProgress.map((p) => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        taskType: p.lesson.taskType,
        completed: p.completed,
        currentStep: p.currentStep,
        totalSteps: p.lesson.steps.length,
        topicTitle: p.topic?.title ?? null,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
      })),
      battles: student.participations.map((p) => ({
        battleId: p.battleId,
        mode: p.battle.mode,
        topicTitle: p.battle.topic.title,
        bandScore: p.bandScore,
        ratingDelta: p.ratingDelta,
        aiScore: p.aiScore,
        aiVerdict: p.aiVerdict,
        createdAt: p.battle.createdAt,
      })),
    },
  })
}
