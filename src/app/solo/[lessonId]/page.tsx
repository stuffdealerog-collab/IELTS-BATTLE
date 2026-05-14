import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { TutorChat } from '@/components/solo/TutorChat'
import { BackButton } from '@/components/tma/BackButton'

interface PageProps {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ reroll?: string }>
}

async function pickRandomTopic(category: string, excludeId?: string) {
  const where = {
    category,
    ...(excludeId ? { NOT: { id: excludeId } } : {}),
  }
  const count = await prisma.essayTopic.count({ where })
  if (count === 0) return null
  const skip = Math.floor(Math.random() * count)
  const [topic] = await prisma.essayTopic.findMany({ where, skip, take: 1 })
  return topic ?? null
}

export default async function LessonPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params
  const { reroll } = await searchParams
  const session = await getSession()

  if (!session) redirect('/')

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!lesson) notFound()

  let progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.userId, lessonId } },
    include: { topic: true },
  })

  const needsTopic = !progress?.topic || reroll === '1' || progress?.completed
  if (needsTopic) {
    const newTopic = await pickRandomTopic(lesson.category, progress?.topicId ?? undefined)
    if (newTopic) {
      progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: session.userId, lessonId } },
        create: {
          userId: session.userId,
          lessonId,
          topicId: newTopic.id,
          currentStep: 1,
        },
        update: {
          topicId: newTopic.id,
          currentStep: reroll === '1' || progress?.completed ? 1 : (progress?.currentStep ?? 1),
          completed: false,
          completedAt: null,
          essayDraft: reroll === '1' || progress?.completed ? '' : (progress?.essayDraft ?? ''),
        },
        include: { topic: true },
      })
    }
  }

  if (!progress?.topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="text-4xl">📚</div>
        <h1 className="text-base font-bold">No topics yet</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          The topic bank is empty — please seed the database first.
        </p>
      </div>
    )
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
        topic={{
          id: progress.topic.id,
          title: progress.topic.title,
          prompt: progress.topic.prompt,
          imageDescription: progress.topic.imageDescription,
        }}
        initialProgress={{
          currentStep: progress.currentStep,
          completed: progress.completed,
          essayDraft: progress.essayDraft,
        }}
      />
    </>
  )
}
