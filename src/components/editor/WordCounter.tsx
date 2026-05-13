'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface WordCounterProps {
  wordCount: number
  minWords: number
}

export function WordCounter({ wordCount, minWords }: WordCounterProps) {
  const pct = Math.min((wordCount / minWords) * 100, 100)
  const met = wordCount >= minWords

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={cn('font-medium', met ? 'text-green-600' : 'text-slate-600')}>
          {wordCount} words
        </span>
        <span className="text-slate-400">min {minWords}</span>
      </div>
      <Progress
        value={pct}
        className={cn('h-2', met ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500')}
      />
      {met && (
        <p className="text-xs text-green-600 font-medium">✓ Minimum word count reached</p>
      )}
      {!met && (
        <p className="text-xs text-slate-400">{minWords - wordCount} more words needed</p>
      )}
    </div>
  )
}
