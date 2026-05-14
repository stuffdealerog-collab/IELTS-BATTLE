'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Swords, X } from 'lucide-react'
import { toast } from 'sonner'
import { getPusherClient } from '@/lib/pusher-client'
import { useTMA } from '@/components/tma/TMAProvider'

export default function BattleQueuePage() {
  return (
    <Suspense fallback={<QueueLoading />}>
      <QueueInner />
    </Suspense>
  )
}

function QueueLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
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

  const mode = params.get('mode') ?? 'FULL'
  const taskType = params.get('taskType') ?? 'TASK2'

  // Timer
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Pusher: listen for match
  useEffect(() => {
    if (!user) return
    const pusher = getPusherClient()
    if (!pusher) {
      // Fallback: poll queue status every 3s
      const poll = setInterval(async () => {
        const res = await fetch('/api/battle/queue')
        const data = await res.json()
        if (data.matchedBattleId) {
          clearInterval(poll)
          router.push(`/battle/${data.matchedBattleId}`)
        }
      }, 3000)
      return () => clearInterval(poll)
    }

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Swords className="w-14 h-14 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold">Searching for opponent…</h1>
        <p className="text-sm text-muted-foreground">
          {mode} {taskType.replace('TASK', 'Task ')}
        </p>
        <p className="text-2xl font-mono tabular-nums">
          {mm}:{ss}
        </p>
      </div>

      <div className="bg-secondary rounded-2xl p-4 max-w-sm">
        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: Open a second device or share with a friend to test multiplayer right now.
        </p>
      </div>

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
