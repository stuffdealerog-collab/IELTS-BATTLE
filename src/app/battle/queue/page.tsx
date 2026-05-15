'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Swords, X, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { getPusherClient } from '@/lib/pusher-client'
import { useTMA } from '@/components/tma/TMAProvider'

const BOT_WAIT_SECONDS = 15

export default function BattleQueuePage() {
  return (
    <Suspense fallback={<QueueLoading />}>
      <QueueInner />
    </Suspense>
  )
}

function QueueLoading() {
  return (
    <div className="min-h-[var(--tg-stable-h,100vh)] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function QueueInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useTMA()
  const [seconds, setSeconds] = useState(0)
  const [isCancelling, setIsCancelling] = useState(false)
  const [botCountdown, setBotCountdown] = useState<number | null>(null)

  const mode = params.get('mode') ?? 'FULL'
  const taskType = params.get('taskType') ?? 'TASK2'

  // Timer + bot countdown
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1
        if (next >= BOT_WAIT_SECONDS) {
          const remaining = BOT_WAIT_SECONDS + 5 - next
          setBotCountdown(remaining > 0 ? remaining : 0)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Poll queue every 3s to trigger bot matching after wait
  useEffect(() => {
    if (!user) return
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/battle/queue', { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, taskType }),
        })
        const data = await res.json()
        if (data.battleId || data.matched) {
          clearInterval(poll)
          router.push(`/battle/${data.battleId}`)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(poll)
  }, [user, mode, taskType, router])

  // Pusher: listen for match
  useEffect(() => {
    if (!user) return
    const pusher = getPusherClient()
    if (!pusher) return

    const channel = pusher.subscribe(`user-${user.id}`)
    channel.bind('match-found', (data: { battleId: string }) => {
      router.push(`/battle/${data.battleId}`)
    })

    return () => {
      pusher.unsubscribe(`user-${user.id}`)
    }
  }, [user, router])

  const handleCancel = async () => {
    setIsCancelling(true)
    await fetch('/api/battle/queue', { method: 'DELETE' })
    toast.success('Left the queue')
    router.push('/battle')
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const inBotPhase = seconds >= BOT_WAIT_SECONDS

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center animate-pulse ${
            inBotPhase ? 'bg-violet-500/10' : 'bg-primary/10'
          }`}
        >
          {inBotPhase ? (
            <Bot className="w-14 h-14 text-violet-500" />
          ) : (
            <Swords className="w-14 h-14 text-primary" />
          )}
        </div>
        <div
          className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${
            inBotPhase ? 'border-violet-500' : 'border-primary'
          }`}
        />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold">
          {inBotPhase ? 'Preparing AI opponent…' : 'Searching for opponent…'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode} · {taskType.replace('TASK', 'Task ')}
        </p>
        <p className="text-2xl font-mono tabular-nums">
          {mm}:{ss}
        </p>
      </div>

      {!inBotPhase && seconds >= 5 && (
        <div className="bg-secondary rounded-2xl p-3 max-w-sm text-center">
          <p className="text-xs text-muted-foreground">
            No humans found yet. AI bot match in{' '}
            <span className="font-bold text-foreground">{BOT_WAIT_SECONDS - seconds}s</span>…
          </p>
        </div>
      )}

      {inBotPhase && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-3 max-w-sm text-center">
          <p className="text-xs text-violet-600 dark:text-violet-400">
            <Bot className="w-3.5 h-3.5 inline mr-1" />
            Matching you with an AI opponent at your skill level
          </p>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isCancelling}
        className="gap-2"
      >
        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        Cancel Search
      </Button>
    </div>
  )
}
