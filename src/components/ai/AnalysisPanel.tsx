'use client'

import { useStreamingAI } from '@/hooks/useStreamingAI'
import { Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalysisPanelProps {
  topicId: string
  content: string
  wordCount: number
  onClose: () => void
}

export function AnalysisPanel({ topicId, content, wordCount, onClose }: AnalysisPanelProps) {
  const { text, isLoading, error, start } = useStreamingAI('/api/ai/analyze')

  const handleAnalyze = () => {
    start({ content, topicId, wordCount })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-800">AI Writing Analysis</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!text && !isLoading && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4 text-sm">
                Get instant AI feedback on your essay structure, vocabulary, and content.
              </p>
              <Button onClick={handleAnalyze} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Analyze My Writing
              </Button>
            </div>
          )}

          {isLoading && !text && (
            <div className="flex items-center gap-2 text-slate-500 py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your essay...</span>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {text && (
            <div className="prose prose-sm max-w-none text-slate-700">
              {text.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h4 key={i} className="font-semibold text-slate-800 mt-4 mb-2 text-sm">
                      {line.replace(/\*\*/g, '')}
                    </h4>
                  )
                }
                if (line.startsWith('- ') || line.startsWith('• ')) {
                  return (
                    <li key={i} className="text-sm ml-4">
                      {line.slice(2)}
                    </li>
                  )
                }
                if (line.trim() === '') return <div key={i} className="h-2" />
                return (
                  <p key={i} className="text-sm leading-relaxed">
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

        {text && !isLoading && (
          <div className="p-4 border-t flex justify-between">
            <Button variant="outline" size="sm" onClick={handleAnalyze}>
              Re-analyze
            </Button>
            <Button size="sm" onClick={onClose}>
              Back to Writing
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
