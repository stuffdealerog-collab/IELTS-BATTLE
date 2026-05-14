import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TopicBrowser } from '@/components/practice/TopicBrowser'
import { BackButton } from '@/components/tma/BackButton'
import { EssayTopic } from '@/types'
import { ChevronLeft, PenLine } from 'lucide-react'

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
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-3xl px-4 tma-safe-top pb-10 space-y-4">
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold flex items-center gap-1.5 truncate">
              <PenLine className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              Free Practice
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Pick a topic or hit Random — write at your own pace
            </p>
          </div>
        </div>
        <TopicBrowser
          topics={topics as EssayTopic[]}
          total={total}
          taskType={taskType}
          category={category}
        />
      </div>
    </div>
  )
}
