'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EssayTopic } from '@/types'
import { useTimer } from '@/hooks/useTimer'
import { useWordCount } from '@/hooks/useWordCount'
import { useAutoSave } from '@/hooks/useAutoSave'
import { MIN_WORDS, TIME_LIMITS } from '@/lib/constants'
import { CountdownTimer } from './CountdownTimer'
import { WordCounter } from './WordCounter'
import { TopicDisplay } from './TopicDisplay'
import { QuickTipsSidebar } from '@/components/ai/QuickTipsSidebar'
import { AnalysisPanel } from '@/components/ai/AnalysisPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sparkles, Send, Lightbulb, Save, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WritingEditorProps {
  topic: EssayTopic
  essayId: string
  initialContent?: string
}

export function WritingEditor({ topic, essayId, initialContent = '' }: WritingEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minWords = MIN_WORDS[topic.taskType as keyof typeof MIN_WORDS] ?? 250
  const totalTime = TIME_LIMITS[topic.taskType as keyof typeof TIME_LIMITS] ?? 2400

  const { timeLeft, isRunning, isExpired, elapsed, start: startTimer, pause: pauseTimer } = useTimer(totalTime)
  const wordCount = useWordCount(content)
  const { isSaving, lastSaved } = useAutoSave(essayId, content, wordCount)

  const handleSubmit = useCallback(async () => {
    if (wordCount < minWords) {
      toast.error(`Write at least ${minWords} words before submitting (currently ${wordCount})`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          content,
          wordCount,
          isDraft: false,
          timeTaken: elapsed,
        }),
      })

      if (!res.ok) throw new Error('Submit failed')
      const { essayId: newEssayId } = await res.json()
      router.push(`/results/${newEssayId}`)
    } catch {
      toast.error('Failed to submit essay. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [content, wordCount, minWords, topic.id, elapsed, router])

  useEffect(() => {
    if (isExpired) toast.warning('Time is up! You can still submit your essay.')
  }, [isExpired])

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel — Topic + Timer */}
      <div className="w-64 shrink-0 border-r bg-slate-50 p-4 overflow-y-auto hidden lg:flex flex-col gap-4">
        <TopicDisplay topic={topic} />
        <div className="border-t pt-4">
          <CountdownTimer
            timeLeft={timeLeft}
            totalTime={totalTime}
            isRunning={isRunning}
            isExpired={isExpired}
          />
          <div className="flex gap-2 mt-3">
            {!isRunning ? (
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={startTimer}>
                <Play className="w-3 h-3" /> Start
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={pauseTimer}>
                <Pause className="w-3 h-3" /> Pause
              </Button>
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <WordCounter wordCount={wordCount} minWords={minWords} />
        </div>
        <div className="text-xs text-slate-400 mt-auto">
          {isSaving ? (
            <span className="flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" /> Saving...
            </span>
          ) : lastSaved ? (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>

      {/* Center — Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <CountdownTimer
              timeLeft={timeLeft}
              totalTime={totalTime}
              isRunning={isRunning}
              isExpired={isExpired}
            />
            <Button size="sm" variant="ghost" onClick={isRunning ? pauseTimer : startTimer}>
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          <WordCounter wordCount={wordCount} minWords={minWords} />
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your essay here..."
          className={cn(
            'flex-1 resize-none rounded-none border-0 border-b focus-visible:ring-0',
            'text-base leading-relaxed p-6 font-mono sm:font-sans',
            'placeholder:text-slate-300'
          )}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between p-3 bg-white border-t gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Mobile tips sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 lg:hidden">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Tips
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <QuickTipsSidebar topicId={topic.id} />
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowAnalysis(true)}
              disabled={wordCount < 50}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">Analyze</span>
            </Button>
          </div>

          <Button
            size="sm"
            className="gap-1"
            onClick={handleSubmit}
            disabled={isSubmitting || wordCount < minWords}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit for Feedback'}
          </Button>
        </div>
      </div>

      {/* Right Panel — Tips (desktop) */}
      <div className="w-72 shrink-0 border-l bg-slate-50 p-4 overflow-y-auto hidden lg:block">
        <QuickTipsSidebar topicId={topic.id} />
      </div>

      {/* Analysis Modal */}
      {showAnalysis && (
        <AnalysisPanel
          topicId={topic.id}
          content={content}
          wordCount={wordCount}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  )
}
