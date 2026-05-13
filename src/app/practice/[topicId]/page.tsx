import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { WritingEditor } from '@/components/editor/WritingEditor'
import { EssayTopic } from '@/types'

interface PageProps {
  params: Promise<{ topicId: string }>
}

export default async function PracticeTopicPage({ params }: PageProps) {
  const { topicId } = await params
  const session = await auth()

  const topic = await prisma.essayTopic.findUnique({ where: { id: topicId } })
  if (!topic) notFound()

  // Create draft essay
  const essay = await prisma.essay.create({
    data: {
      userId: session?.user?.id ?? null,
      topicId: topic.id,
      isDraft: true,
    },
  })

  return (
    <WritingEditor
      topic={topic as EssayTopic}
      essayId={essay.id}
      initialContent=""
    />
  )
}
