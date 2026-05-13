import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/constants'
import { EssayTopic } from '@/types'

interface TopicDisplayProps {
  topic: EssayTopic
}

export function TopicDisplay({ topic }: TopicDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          {topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {CATEGORY_LABELS[topic.category] ?? topic.category}
        </Badge>
      </div>
      <h2 className="font-semibold text-slate-800 text-sm leading-snug">{topic.title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border">
        {topic.prompt}
      </div>
      {topic.imageDescription && (
        <div className="text-xs text-slate-500 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <span className="font-medium text-blue-700">📊 Chart description: </span>
          {topic.imageDescription}
        </div>
      )}
    </div>
  )
}
