import { prisma } from '@/lib/prisma'
import { TopicBrowser } from '@/components/practice/TopicBrowser'
import { EssayTopic } from '@/types'

interface PageProps {
  searchParams: Promise<{ taskType?: string; category?: string }>
}

export default async function PracticePage({ searchParams }: PageProps) {
  const { taskType = 'ALL', category = 'ALL' } = await searchParams

  const where = {
    ...(taskType !== 'ALL' ? { taskType } : {}),
    ...(category !== 'ALL' ? { category } : {}),
  }

  const [topics, total] = await Promise.all([
    prisma.essayTopic.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.essayTopic.count({ where }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Choose a Topic</h1>
        <p className="text-slate-500 text-sm">
          Select a topic to practice or hit "Random Topic" for a surprise.
        </p>
      </div>
      <TopicBrowser
        topics={topics as EssayTopic[]}
        total={total}
        taskType={taskType}
        category={category}
      />
    </div>
  )
}
