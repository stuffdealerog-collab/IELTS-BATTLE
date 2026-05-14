'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LessonStep {
  id: string
  order: number
  partType: string
  title: string
  instruction: string
  starter: string | null
}

interface Lesson {
  id: string
  title: string
  description: string
  taskType: string
  category: string
  steps: LessonStep[]
}

interface Progress {
  currentStep: number
  completed: boolean
  essayDraft: string
}

interface Evaluation {
  score: number
  passed: boolean
  encouragement: string
  strengths: string
  improvements: string
  nextAction: string
}

interface ChatMessage {
  role: 'tutor' | 'user' | 'evaluation'
  text?: string
  evaluation?: Evaluation
}

interface TutorChatProps {
  lesson: Lesson
  initialProgress: Progress | null
}

export function TutorChat({ lesson, initialProgress }: TutorChatProps) {
  const router = useRouter()
  const [currentStepIdx, setCurrentStepIdx] = useState(
    Math.min((initialProgress?.currentStep ?? 1) - 1, lesson.steps.length - 1)
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [attempt, setAttempt] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [essayDraft, setEssayDraft] = useState(initialProgress?.essayDraft ?? '')
  const [allDone, setAllDone] = useState(initialProgress?.completed ?? false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentStep = lesson.steps[currentStepIdx]

  // Initial tutor message
  useEffect(() => {
    if (!currentStep || messages.length > 0) return
    const initialMsg =
      currentStepIdx === 0
        ? `👋 Welcome! I'll guide you through writing a ${lesson.title}. We'll do this in ${lesson.steps.length} steps.\n\n**Step ${currentStep.order}: ${currentStep.title}**\n\n${currentStep.instruction}`
        : `**Step ${currentStep.order}: ${currentStep.title}**\n\n${currentStep.instruction}`

    setMessages([{ role: 'tutor', text: initialMsg }])
    if (currentStep.starter) setAttempt(currentStep.starter + ' ')
  }, [currentStepIdx, currentStep, lesson, messages.length])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isEvaluating])

  const handleSubmit = async () => {
    if (!attempt.trim() || isEvaluating) return
    if (attempt.trim().length < 15) {
      toast.error('Please write at least a full sentence')
      return
    }

    const userMsg = attempt.trim()
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setAttempt('')
    setIsEvaluating(true)

    try {
      const res = await fetch('/api/lesson/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          stepId: currentStep.id,
          attempt: userMsg,
          attemptNumber,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? 'Evaluation failed')
        setMessages((m) => [...m.slice(0, -1)])
        setAttempt(userMsg)
        return
      }

      const { evaluation } = await res.json()
      setMessages((m) => [...m, { role: 'evaluation', evaluation }])

      if (evaluation.passed) {
        const newDraft = essayDraft + (essayDraft ? '\n\n' : '') + userMsg
        setEssayDraft(newDraft)
        setAttemptNumber(1)

        if (currentStepIdx + 1 < lesson.steps.length) {
          setTimeout(() => {
            setCurrentStepIdx((i) => i + 1)
            setMessages((m) => [
              ...m,
              {
                role: 'tutor',
                text: `**Step ${lesson.steps[currentStepIdx + 1].order}: ${lesson.steps[currentStepIdx + 1].title}**\n\n${lesson.steps[currentStepIdx + 1].instruction}`,
              },
            ])
            const nextStarter = lesson.steps[currentStepIdx + 1].starter
            if (nextStarter) setAttempt(nextStarter + ' ')
          }, 1500)
        } else {
          setTimeout(() => setAllDone(true), 1500)
        }
      } else {
        setAttemptNumber((n) => n + 1)
        setAttempt(userMsg)
      }
    } catch {
      toast.error('Network error')
      setMessages((m) => m.slice(0, -1))
      setAttempt(userMsg)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleRetry = () => {
    setMessages((m) => m.slice(0, -2))
  }

  const progressPct = ((currentStepIdx + (allDone ? 1 : 0)) / lesson.steps.length) * 100

  if (allDone) {
    return (
      <div className="min-h-screen p-4 pb-32 space-y-4">
        <div className="text-center pt-6 pb-4 space-y-3">
          <div className="text-6xl">🎉</div>
          <h1 className="text-2xl font-bold">Lesson Complete!</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You&apos;ve mastered the structure of <strong>{lesson.title}</strong>. Here&apos;s your full essay:
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{essayDraft}</p>
            <p className="text-xs text-muted-foreground mt-3">
              {essayDraft.split(/\s+/).filter(Boolean).length} words
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={() => router.push('/battle')} className="w-full gap-2">
            <Trophy className="w-4 h-4" />
            Battle Someone Now
          </Button>
          <Button variant="outline" onClick={() => router.push('/solo')} className="w-full">
            Back to Lessons
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold text-sm truncate">{lesson.title}</h1>
          <Badge variant="secondary" className="text-[10px] h-5">
            {currentStepIdx + 1}/{lesson.steps.length}
          </Badge>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          if (msg.role === 'tutor') {
            return (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )
          }
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )
          }
          if (msg.role === 'evaluation' && msg.evaluation) {
            const ev = msg.evaluation
            return (
              <div key={i} className="flex gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    ev.passed ? 'bg-emerald-100' : 'bg-amber-100'
                  )}
                >
                  {ev.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div
                  className={cn(
                    'rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] space-y-2',
                    ev.passed
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-amber-50 border border-amber-200'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">
                      Score: {ev.score}/5
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px] h-4 px-1.5 border-0',
                        ev.passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {ev.passed ? '✓ Passed' : 'Keep trying'}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/90">{ev.encouragement}</p>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong className="text-emerald-700">✓ Strengths:</strong> {ev.strengths}
                    </p>
                    <p>
                      <strong className="text-amber-700">→ Improve:</strong> {ev.improvements}
                    </p>
                  </div>
                  <p className="text-xs italic text-muted-foreground pt-1">{ev.nextAction}</p>
                  {!ev.passed && (
                    <Button size="sm" variant="outline" onClick={handleRetry} className="gap-1 h-7 text-xs">
                      <RotateCcw className="w-3 h-3" />
                      Rewrite
                    </Button>
                  )}
                </div>
              </div>
            )
          }
          return null
        })}

        {isEvaluating && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-card p-3 sticky bottom-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="Write your attempt here…"
            className="resize-none min-h-[44px] max-h-32 text-sm rounded-2xl"
            disabled={isEvaluating}
            rows={2}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={isEvaluating || !attempt.trim()}
            className="rounded-full shrink-0 w-10 h-10"
          >
            {isEvaluating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          {attempt.split(/\s+/).filter(Boolean).length} words · Attempt {attemptNumber}
        </p>
      </div>
    </div>
  )
}
