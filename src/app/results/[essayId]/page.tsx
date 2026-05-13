import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FeedbackReport } from '@/components/ai/FeedbackReport'
import { TopicDisplay } from '@/components/editor/TopicDisplay'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, RotateCcw } from 'lucide-react'
import { EssayTopic } from '@/types'
import { formatTime } from '@/lib/utils'

interface PageProps {
  params: Promise<{ essayId: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { essayId } = await params

  const essay = await prisma.essay.findUnique({
    where: { id: essayId },
    include: { topic: true, feedback: true },
  })

  if (!essay) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/practice">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/practice/${essay.topicId}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              Retry Topic
            </Button>
          </Link>
          <Link href="/practice">
            <Button size="sm" className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              New Topic
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — topic + essay */}
        <div className="lg:col-span-1 space-y-4">
          <TopicDisplay topic={essay.topic as EssayTopic} />

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{essay.wordCount} words</Badge>
            {essay.timeTaken && (
              <Badge variant="outline">⏱ {formatTime(essay.timeTaken)}</Badge>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl border p-4 max-h-60 overflow-y-auto">
            <p className="text-xs text-slate-400 mb-2 font-medium">Your essay:</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {essay.content}
            </p>
          </div>
        </div>

        {/* Right — feedback */}
        <div className="lg:col-span-2">
          <FeedbackReport
            essayId={essay.id}
            topicId={essay.topicId}
            content={essay.content}
            wordCount={essay.wordCount}
            savedFeedback={essay.feedback}
          />
        </div>
      </div>
    </div>
  )
}
