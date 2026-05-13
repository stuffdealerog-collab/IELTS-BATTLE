'use client'

import { useEffect } from 'react'
import { useStreamingAI } from '@/hooks/useStreamingAI'
import { Loader2, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickTipsSidebarProps {
  topicId: string
  autoLoad?: boolean
}

export function QuickTipsSidebar({ topicId, autoLoad = true }: QuickTipsSidebarProps) {
  const { text, isLoading, error, start, reset } = useStreamingAI('/api/ai/tips')

  useEffect(() => {
    if (autoLoad && topicId) {
      start({ topicId })
    }
  }, [topicId, autoLoad]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReload = () => {
    reset()
    start({ topicId })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-sm text-slate-700">Writing Tips</span>
        </div>
        {!isLoading && (
          <Button variant="ghost" size="sm" onClick={handleReload} className="text-xs h-7 px-2">
            Refresh
          </Button>
        )}
      </div>

      {isLoading && !text && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading tips...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Failed to load tips. {error}</p>
      )}

      {text && (
        <div className="prose prose-sm max-w-none text-slate-600 overflow-y-auto flex-1">
          {text.split('\n').map((line, i) => {
            if (line.match(/^\d+\./)) {
              return (
                <div key={i} className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs leading-relaxed m-0">{line}</p>
                </div>
              )
            }
            if (line.trim() === '') return <div key={i} className="h-1" />
            return (
              <p key={i} className="text-xs leading-relaxed m-0">
                {line}
              </p>
            )
          })}
          {isLoading && (
            <span className="inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5" />
          )}
        </div>
      )}
    </div>
  )
}
