'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getPusherClient, battleChannel } from '@/lib/pusher-client'
import { useTMA } from '@/components/tma/TMAProvider'
import { getBattleMinWords } from '@/lib/battle-config'
import { formatTime, countWords, cn } from '@/lib/utils'
import { PART_LABELS } from '@/lib/battle-config'
import { Send, Swords, Clock, CheckCircle2, Loader2 } from 'lucide-react'

interface BattleData {
  id: string
  status: string
  mode: string
  partType: string | null
  timeLimit: number
  startedAt: string
  topic: {
    id: string
    taskType: string
    category: string
    title: string
    prompt: string
    imageDescription: string | null
  }
}

interface OpponentInfo {
  username: string | null
  firstName: string | null
  photoUrl: string | null
  rating: number
  wordCount: number
  submitted: boolean
}

interface BattleArenaProps {
  battle: BattleData
  initialOpponent: OpponentInfo | null
}

export function BattleArena({ battle, initialOpponent }: BattleArenaProps) {
  const router = useRouter()
  const { user } = useTMA()
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [opponent, setOpponent] = useState<OpponentInfo | null>(initialOpponent)
  const [timeLeft, setTimeLeft] = useState(battle.timeLimit)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(battle.status)
  const startedRef = useRef(new Date(battle.startedAt).getTime())

  const minWords = getBattleMinWords(battle.mode, battle.topic.taskType)

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedRef.current) / 1000)
      const remaining = Math.max(battle.timeLimit - elapsed, 0)
      setTimeLeft(remaining)
      if (remaining === 0 && !submitted) {
        handleSubmit(true)
      }
    }, 500)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.timeLimit, submitted])

  // Word count
  useEffect(() => {
    setWordCount(countWords(content))
  }, [content])

  // Heartbeat every 3s
  useEffect(() => {
    if (submitted) return
    const id = setInterval(() => {
      fetch(`/api/battle/${battle.id}/heartbeat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, wordCount: countWords(content) }),
      }).catch(() => {})
    }, 3000)
    return () => clearInterval(id)
  }, [battle.id, content, submitted])

  // Pusher: listen for opponent updates
  useEffect(() => {
    if (!user) return
    const pusher = getPusherClient()
    if (!pusher) {
      const poll = setInterval(async () => {
        const res = await fetch(`/api/battle/${battle.id}/state`)
        const data = await res.json()
        if (data.opponent) setOpponent(data.opponent)
        if (data.battle.status === 'EVALUATING' || data.battle.status === 'COMPLETED') {
          setStatus(data.battle.status)
          if (data.battle.status === 'COMPLETED') {
            router.push(`/battle/${battle.id}/results`)
          }
        }
      }, 3000)
      return () => clearInterval(poll)
    }

    const channel = pusher.subscribe(battleChannel(battle.id))
    channel.bind('opponent-progress', (data: { userId: string; wordCount: number }) => {
      if (data.userId !== user.id) {
        setOpponent((o) => (o ? { ...o, wordCount: data.wordCount } : o))
      }
    })
    channel.bind('opponent-submitted', (data: { userId: string }) => {
      if (data.userId !== user.id) {
        setOpponent((o) => (o ? { ...o, submitted: true } : o))
        toast.info('Opponent submitted! Hurry up.')
      }
    })
    channel.bind('battle-evaluating', () => setStatus('EVALUATING'))
    channel.bind('battle-completed', () => router.push(`/battle/${battle.id}/results`))

    return () => {
      pusher.unsubscribe(battleChannel(battle.id))
    }
  }, [battle.id, user, router])

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitted || isSubmitting) return
      if (!auto && wordCount < minWords) {
        toast.error(`Write at least ${minWords} words (${wordCount} so far)`)
        return
      }
      setIsSubmitting(true)
      try {
        const res = await fetch(`/api/battle/${battle.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, wordCount }),
        })
        if (!res.ok) {
          toast.error('Submit failed')
          setIsSubmitting(false)
          return
        }
        setSubmitted(true)
        toast.success('Submitted! Waiting for opponent…')
      } catch {
        toast.error('Network error')
        setIsSubmitting(false)
      }
    },
    [battle.id, content, wordCount, minWords, submitted, isSubmitting]
  )

  // Auto-redirect when evaluating completes
  useEffect(() => {
    if (status === 'COMPLETED') router.push(`/battle/${battle.id}/results`)
  }, [status, battle.id, router])

  const wordPct = Math.min((wordCount / minWords) * 100, 100)
  const timePct = (timeLeft / battle.timeLimit) * 100
  const opName = opponent?.firstName ?? opponent?.username ?? 'Opponent'
  const myName = user?.firstName ?? user?.username ?? 'You'

  if (status === 'EVALUATING' || (submitted && !opponent?.submitted && timeLeft > 0)) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-center">
          {status === 'EVALUATING' ? 'AI is judging…' : 'Waiting for opponent…'}
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {status === 'EVALUATING'
            ? 'Both essays are being scored on 4 IELTS criteria. Almost done!'
            : `${opName} is still writing. Time left: ${formatTime(timeLeft)}`}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col">
      {/* Header — opponent + me bars */}
      <div className="px-3 pt-3 pb-2 bg-card/95 backdrop-blur border-b sticky top-0 z-10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {user?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoUrl} alt="you" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                {myName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{myName}</p>
              <p className="text-muted-foreground">{wordCount}w</p>
            </div>
          </div>

          <div className="flex flex-col items-center mx-2">
            <Swords className="w-4 h-4 text-red-500" />
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5">
              {battle.mode}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="font-semibold truncate">{opName}</p>
              <p className="text-muted-foreground">
                {opponent?.wordCount ?? 0}w {opponent?.submitted && '✓'}
              </p>
            </div>
            {opponent?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={opponent.photoUrl} alt="opp" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                {opName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Timer + word progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span
              className={cn(
                'font-mono font-bold flex items-center gap-1',
                timeLeft < 60 && 'text-red-600',
                timeLeft >= 60 && timeLeft < 180 && 'text-amber-600'
              )}
            >
              <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
            </span>
            <span className="text-muted-foreground">
              {wordCount}/{minWords} words
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Progress
              value={timePct}
              className={cn(
                'h-1',
                timeLeft < 60 ? '[&>div]:bg-red-500' : timeLeft < 180 ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'
              )}
            />
            <Progress
              value={wordPct}
              className={cn('h-1', wordCount >= minWords ? '[&>div]:bg-emerald-500' : '[&>div]:bg-slate-400')}
            />
          </div>
        </div>
      </div>

      {/* Topic */}
      <div className="p-3 bg-secondary/50 border-b">
        <div className="flex gap-1.5 mb-1.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {battle.topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {battle.topic.category.replace(/_/g, ' ')}
          </Badge>
          {battle.partType && (
            <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] h-4 px-1.5">
              {PART_LABELS[battle.partType]}
            </Badge>
          )}
        </div>
        <p className="text-xs leading-relaxed line-clamp-4">{battle.topic.prompt}</p>
        {battle.topic.imageDescription && (
          <p className="text-[11px] text-muted-foreground mt-2 italic">
            📊 {battle.topic.imageDescription}
          </p>
        )}
      </div>

      {/* Editor */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your essay here…"
        disabled={submitted}
        className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 text-sm leading-relaxed p-4"
      />

      {/* Bottom */}
      <div
        className="p-3 border-t bg-card sticky bottom-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        <Button
          size="lg"
          className="w-full gap-2 h-11 rounded-xl"
          onClick={() => handleSubmit(false)}
          disabled={submitted || isSubmitting || wordCount < minWords}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : submitted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitted ? 'Submitted' : isSubmitting ? 'Submitting…' : 'Submit for Judgement'}
        </Button>
      </div>
    </div>
  )
}
