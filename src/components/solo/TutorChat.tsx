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
  ChevronDown,
  ChevronUp,
  Shuffle,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VocabItem {
  word: string
  definition: string
  example: string
}

interface LessonStep {
  id: string
  order: number
  partType: string
  title: string
  instruction: string
  starter: string | null
  vocabBank: VocabItem[] | null
  grammarTip: string | null
  modelAnswer: string | null
}

interface Lesson {
  id: string
  title: string
  description: string
  taskType: string
  category: string
  steps: LessonStep[]
}

interface Topic {
  id: string
  title: string
  prompt: string
  imageDescription: string | null
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
  topic: Topic
  initialProgress: Progress | null
}

export function TutorChat({ lesson, topic, initialProgress }: TutorChatProps) {
  const router = useRouter()
  const [currentStepIdx, setCurrentStepIdx] = useState(
    Math.min(Math.max((initialProgress?.currentStep ?? 1) - 1, 0), lesson.steps.length - 1)
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [attempt, setAttempt] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [essayDraft, setEssayDraft] = useState(initialProgress?.essayDraft ?? '')
  const [allDone, setAllDone] = useState(initialProgress?.completed ?? false)
  const [topicExpanded, setTopicExpanded] = useState(true)
  const [vocabExpanded, setVocabExpanded] = useState(true)
  const [modelExpanded, setModelExpanded] = useState(false)
  const [passedStepIdx, setPassedStepIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  const currentStep = lesson.steps[currentStepIdx]
  const isTask1 = lesson.taskType === 'TASK1'

  // Initial tutor message
  useEffect(() => {
    if (!currentStep || initRef.current) return
    initRef.current = true
    const initialMsg = `👋 Welcome! Let&apos;s build your **${lesson.title}** together in ${lesson.steps.length} steps.\n\n📌 Your topic is shown above — read it carefully before writing.\n\n**Step ${currentStep.order}: ${currentStep.title}**\n\n${currentStep.instruction}`

    setMessages([{ role: 'tutor', text: initialMsg }])
    if (currentStep.starter) setAttempt(currentStep.starter + ' ')
  }, [currentStep, lesson])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isEvaluating])

  // Collapse topic banner once user starts typing on smaller screens
  useEffect(() => {
    if (messages.length > 2 && topicExpanded) setTopicExpanded(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

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
        const { error } = await res.json().catch(() => ({ error: 'Evaluation failed' }))
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
        setPassedStepIdx(currentStepIdx)
        setModelExpanded(false)

        if (currentStepIdx + 1 < lesson.steps.length) {
          setTimeout(() => {
            setPassedStepIdx(null)
            setVocabExpanded(true)
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

  const handleRerollTopic = () => {
    if (
      !confirm(
        'Get a new topic? Your progress on this lesson will reset.'
      )
    )
      return
    router.push(`/solo/${lesson.id}?reroll=1`)
    router.refresh()
  }

  const progressPct = ((currentStepIdx + (allDone ? 1 : 0)) / lesson.steps.length) * 100

  if (allDone) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] safe-area">
        <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-32 space-y-5">
          <div className="text-center pt-4 pb-2 space-y-3">
            <div className="text-6xl">🎉</div>
            <h1 className="text-2xl font-bold tracking-tight">Lesson Complete!</h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You&apos;ve mastered <strong>{lesson.title}</strong>. Here&apos;s your full essay:
            </p>
          </div>

          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 px-4 py-3 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Topic
              </p>
              <p className="text-sm font-semibold mt-0.5 leading-snug">{topic.title}</p>
            </div>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{essayDraft}</p>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                {essayDraft.split(/\s+/).filter(Boolean).length} words ·{' '}
                {lesson.steps.length} steps
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => router.push('/battle')} className="w-full gap-2 h-11 rounded-xl">
              <Trophy className="w-4 h-4" />
              Battle Someone Now
            </Button>
            <Button
              variant="outline"
              onClick={handleRerollTopic}
              className="w-full gap-2 h-11 rounded-xl"
            >
              <Shuffle className="w-4 h-4" />
              Try Again with New Topic
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/solo')}
              className="w-full h-11 rounded-xl"
            >
              Back to Lessons
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[var(--tg-stable-h,100vh)] bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm truncate">{lesson.title}</h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Step {currentStepIdx + 1} of {lesson.steps.length} · {currentStep.title}
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
              {currentStepIdx + 1}/{lesson.steps.length}
            </Badge>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Topic Banner */}
        <div className="mx-auto w-full max-w-2xl px-4 pb-3">
          <div className="rounded-xl border bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5 overflow-hidden">
            <button
              onClick={() => setTopicExpanded((v) => !v)}
              className="w-full px-3 py-2.5 flex items-center gap-2 text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide leading-none">
                  IELTS Topic · {isTask1 ? 'Task 1' : 'Task 2'}
                </p>
                <p className="text-xs font-medium mt-0.5 truncate">{topic.title}</p>
              </div>
              {topicExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </button>
            {topicExpanded && (
              <div className="px-3 pb-3 pt-1 space-y-2 border-t">
                <p className="text-xs leading-relaxed text-foreground/90">{topic.prompt}</p>
                {isTask1 && topic.imageDescription && (
                  <div className="rounded-lg bg-muted/50 p-2.5 border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ImageIcon className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Chart Data
                      </p>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/80">
                      {topic.imageDescription}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleRerollTopic}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                >
                  <Shuffle className="w-3 h-3" />
                  Get different topic (resets progress)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vocab Bank */}
      {currentStep.vocabBank && currentStep.vocabBank.length > 0 && (
        <div className="border-b bg-background">
          <div className="mx-auto w-full max-w-2xl px-4 pb-2">
            <button
              onClick={() => setVocabExpanded((v) => !v)}
              className="w-full flex items-center gap-2 py-2 text-left"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex-1">
                Vocab Bank ({currentStep.vocabBank.length} words)
              </span>
              {vocabExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {vocabExpanded && (
              <div className="grid grid-cols-1 gap-1.5 pb-1">
                {currentStep.grammarTip && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-2 flex gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                      <strong>Grammar tip:</strong> {currentStep.grammarTip}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  {currentStep.vocabBank.map((v) => (
                    <div
                      key={v.word}
                      className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2.5 py-2"
                    >
                      <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 leading-tight">
                        {v.word}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                        {v.definition}
                      </p>
                      <p className="text-[10px] italic text-foreground/60 leading-snug mt-0.5 line-clamp-1">
                        &ldquo;{v.example}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Answer (shown after passing) */}
      {passedStepIdx === currentStepIdx && currentStep.modelAnswer && (
        <div className="border-b bg-background">
          <div className="mx-auto w-full max-w-2xl px-4 pb-2">
            <button
              onClick={() => setModelExpanded((v) => !v)}
              className="w-full flex items-center gap-2 py-2 text-left"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex-1">
                See model answer
              </span>
              {modelExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {modelExpanded && (
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-3 py-2.5 mb-1">
                <p className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {currentStep.modelAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-4 space-y-3">
          {messages.map((msg, i) => {
            if (msg.role === 'tutor') {
              return (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[85%] shadow-sm">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )
            }
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[85%] shadow-sm">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )
            }
            if (msg.role === 'evaluation' && msg.evaluation) {
              const ev = msg.evaluation
              return (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                      ev.passed
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600'
                    )}
                  >
                    {ev.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl rounded-tl-md px-3.5 py-3 max-w-[85%] space-y-2 shadow-sm',
                      ev.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900'
                    )}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">Score: {ev.score}/5</span>
                      <Badge
                        className={cn(
                          'text-[10px] h-4 px-1.5 border-0',
                          ev.passed
                            ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        )}
                      >
                        {ev.passed ? '✓ Passed' : 'Keep trying'}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/90">{ev.encouragement}</p>
                    <div className="text-xs space-y-1.5">
                      <p>
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          ✓ Strengths:
                        </strong>{' '}
                        {ev.strengths}
                      </p>
                      <p>
                        <strong className="text-amber-700 dark:text-amber-400">→ Improve:</strong>{' '}
                        {ev.improvements}
                      </p>
                    </div>
                    <p className="text-xs italic text-muted-foreground pt-1">{ev.nextAction}</p>
                    {!ev.passed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetry}
                        className="gap-1 h-7 text-xs"
                      >
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
            <div className="flex gap-2 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div
        className="sticky bottom-0 border-t bg-background/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-2xl px-3 py-2.5">
          <div className="flex items-end gap-2">
            <Textarea
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              placeholder="Write your attempt here…"
              className="resize-none min-h-[44px] max-h-32 text-sm rounded-2xl bg-secondary border-0 focus-visible:ring-1"
              disabled={isEvaluating}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isEvaluating || !attempt.trim()}
              className="rounded-full shrink-0 w-11 h-11 shadow-sm"
            >
              {isEvaluating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-[10px] text-muted-foreground">
              {attempt.split(/\s+/).filter(Boolean).length} words
            </p>
            <p className="text-[10px] text-muted-foreground">
              Attempt {attemptNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
