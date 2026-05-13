import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CATEGORY_LABELS } from '@/lib/constants'
import { EssayTopic } from '@/types'
import { ArrowRight, Image, BarChart3 } from 'lucide-react'

interface TopicCardProps {
  topic: EssayTopic
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/practice/${topic.id}`}>
      <Card className="group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge
              variant={topic.taskType === 'TASK1' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[topic.category] ?? topic.category}
            </Badge>
            {topic.imageDescription && (
              <Badge variant="outline" className="text-xs gap-1">
                <Image className="w-2.5 h-2.5" />
                Visual
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">
            {topic.title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{topic.prompt}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">
              {topic.taskType === 'TASK1' ? '150 words · 20 min' : '250 words · 40 min'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
