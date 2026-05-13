import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS } from '@/lib/constants'
import { bandToColor, formatTime } from '@/lib/utils'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface EssayHistoryItem {
  id: string
  topicId: string
  wordCount: number
  timeTaken: number | null
  submittedAt: Date | null
  topic: { title: string; taskType: string; category: string }
  feedback: {
    overallBand: number
    taskAchievement: number
    coherence: number
    lexical: number
    grammar: number
  } | null
}

interface EssayHistoryTableProps {
  essays: EssayHistoryItem[]
}

export function EssayHistoryTable({ essays }: EssayHistoryTableProps) {
  if (essays.length === 0) {
    return (
      <p className="text-slate-400 text-sm py-4 text-center">
        No submitted essays yet. Start practicing to see your history here.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500 text-xs">
            <th className="pb-2 font-medium">Topic</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium text-right">Words</th>
            <th className="pb-2 font-medium text-right">Band</th>
            <th className="pb-2 font-medium text-right">Date</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {essays.map((essay) => (
            <tr key={essay.id} className="border-b hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4">
                <p className="font-medium text-slate-800 line-clamp-1">{essay.topic.title}</p>
                <p className="text-xs text-slate-400">{CATEGORY_LABELS[essay.topic.category] ?? essay.topic.category}</p>
              </td>
              <td className="py-3 pr-4">
                <Badge variant="secondary" className="text-xs">
                  {essay.topic.taskType === 'TASK1' ? 'T1' : 'T2'}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-right text-slate-600">{essay.wordCount}</td>
              <td className="py-3 pr-4 text-right">
                {essay.feedback ? (
                  <span className={cn('font-bold text-base', bandToColor(essay.feedback.overallBand))}>
                    {essay.feedback.overallBand.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
              <td className="py-3 pr-4 text-right text-xs text-slate-400">
                {essay.submittedAt ? format(new Date(essay.submittedAt), 'MMM d') : '—'}
              </td>
              <td className="py-3">
                <Link href={`/results/${essay.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
