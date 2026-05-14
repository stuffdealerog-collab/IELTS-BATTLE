import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'

export async function GET() {
  const session = await getSession()
  const lessons = await prisma.lesson.findMany({
    include: { steps: { select: { id: true } } },
    orderBy: { order: 'asc' },
  })

  let progressByLesson: Record<string, { currentStep: number; completed: boolean }> = {}
  if (session) {
    const progresses = await prisma.lessonProgress.findMany({
      where: { userId: session.userId },
    })
    progressByLesson = Object.fromEntries(
      progresses.map((p) => [p.lessonId, { currentStep: p.currentStep, completed: p.completed }])
    )
  }

  return NextResponse.json({
    lessons: lessons.map((l) => ({
      id: l.id,
      taskType: l.taskType,
      category: l.category,
      title: l.title,
      description: l.description,
      order: l.order,
      stepCount: l.steps.length,
      progress: progressByLesson[l.id] ?? null,
    })),
  })
}
