import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/constants'
import { EssayTopic } from '@/types'
import { ChevronRight, Image as ImageIcon } from 'lucide-react'

interface TopicCardProps {
  topic: EssayTopic
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/practice/${topic.id}`} className="block group">
      <div className="rounded-2xl bg-card p-3.5 elev-1 group-active:scale-[0.99] transition-transform h-full flex flex-col">
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <Badge
            variant={topic.taskType === 'TASK1' ? 'outline' : 'secondary'}
            className="text-[10px] h-4 px-1.5 font-medium"
          >
            {topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium">
            {CATEGORY_LABELS[topic.category] ?? topic.category}
          </Badge>
          {topic.imageDescription && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium gap-0.5">
              <ImageIcon className="w-2.5 h-2.5" />
              Visual
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-sm leading-snug">{topic.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1.5 flex-1">
          {topic.prompt}
        </p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t">
          <span className="text-[10px] text-muted-foreground">
            {topic.taskType === 'TASK1' ? '150 words · 20 min' : '250 words · 40 min'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
