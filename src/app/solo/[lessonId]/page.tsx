import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { TutorChat } from '@/components/solo/TutorChat'
import { BackButton } from '@/components/tma/BackButton'

interface PageProps {
  params: Promise<{ lessonId: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params
  const session = await getSession()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!lesson) notFound()

  let progress = null
  if (session) {
    progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
    })
  }

  return (
    <>
      <BackButton fallbackPath="/solo" />
      <TutorChat
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          taskType: lesson.taskType,
          category: lesson.category,
          steps: lesson.steps.map((s) => ({
            id: s.id,
            order: s.order,
            partType: s.partType,
            title: s.title,
            instruction: s.instruction,
            starter: s.starter,
          })),
        }}
        initialProgress={
          progress
            ? {
                currentStep: progress.currentStep,
                completed: progress.completed,
                essayDraft: progress.essayDraft,
              }
            : null
        }
      />
    </>
  )
}
