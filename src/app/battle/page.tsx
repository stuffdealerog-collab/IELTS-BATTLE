'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/tma/BackButton'
import {
  Swords,
  Zap,
  Target,
  Trophy,
  ChevronLeft,
  Loader2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PART_LABELS } from '@/lib/battle-config'

type Mode = 'QUICK' | 'PART' | 'FULL'
type TaskType = 'TASK1' | 'TASK2'

const MODES: { id: Mode; icon: typeof Zap; label: string; time: string; desc: string; color: string }[] = [
  { id: 'QUICK', icon: Zap, label: 'Quick Battle', time: '5 min', desc: 'One paragraph showdown', color: 'amber' },
  { id: 'PART', icon: Target, label: 'Part Battle', time: '10 min', desc: 'Pick a section to compete on', color: 'purple' },
  { id: 'FULL', icon: Trophy, label: 'Full Battle', time: '20-40 min', desc: 'Complete IELTS essay', color: 'red' },
]

export default function BattlePage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode | null>(null)
  const [taskType, setTaskType] = useState<TaskType>('TASK2')
  const [partType, setPartType] = useState<string | null>(null)
  const [isFinding, setIsFinding] = useState(false)

  const handleStart = async () => {
    if (!mode) return
    if (mode === 'PART' && !partType) {
      toast.error('Choose which part to compete on')
      return
    }

    setIsFinding(true)
    try {
      const res = await fetch('/api/battle/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, taskType, partType }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to enter queue')
        setIsFinding(false)
        return
      }
      if (data.battleId) {
        router.push(`/battle/${data.battleId}`)
      } else {
        router.push(`/battle/queue?mode=${mode}&taskType=${taskType}${partType ? `&partType=${partType}` : ''}`)
      }
    } catch {
      toast.error('Network error')
      setIsFinding(false)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-8 space-y-4">
      <BackButton fallbackPath="/" />
      <div className="flex items-center gap-2 pt-2">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-600" />
            Choose Battle Mode
          </h1>
          <p className="text-xs text-muted-foreground">1v1 ranked match</p>
        </div>
      </div>

      {/* Task type tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTaskType('TASK1')}
          className={cn(
            'rounded-xl p-3 text-sm font-medium border-2 transition-colors',
            taskType === 'TASK1' ? 'border-primary bg-primary/5' : 'border-border bg-card text-muted-foreground'
          )}
        >
          Task 1 (Charts)
        </button>
        <button
          onClick={() => setTaskType('TASK2')}
          className={cn(
            'rounded-xl p-3 text-sm font-medium border-2 transition-colors',
            taskType === 'TASK2' ? 'border-primary bg-primary/5' : 'border-border bg-card text-muted-foreground'
          )}
        >
          Task 2 (Essay)
        </button>
      </div>

      {/* Modes */}
      <div className="space-y-2">
        {MODES.map((m) => {
          const Icon = m.icon
          const selected = mode === m.id
          return (
            <button key={m.id} onClick={() => setMode(m.id)} className="w-full text-left">
              <Card
                className={cn(
                  'border-2 transition-all',
                  selected ? 'border-primary shadow-md' : 'border-border'
                )}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', `bg-${m.color}-100`)}>
                    <Icon className={cn('w-5 h-5', `text-${m.color}-600`)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm">{m.label}</h3>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {m.time}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {selected && <div className="w-3 h-3 rounded-full bg-primary" />}
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Part selector */}
      {mode === 'PART' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Choose Part</p>
          <div className="grid grid-cols-2 gap-2">
            {['INTRO', 'BODY_1', 'BODY_2', 'CONCLUSION'].map((p) => (
              <button
                key={p}
                onClick={() => setPartType(p)}
                className={cn(
                  'rounded-lg p-3 text-xs font-medium border-2 transition-colors',
                  partType === p
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card text-muted-foreground'
                )}
              >
                {PART_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full gap-2 mt-4"
        onClick={handleStart}
        disabled={!mode || isFinding}
      >
        {isFinding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Swords className="w-4 h-4" />
        )}
        {isFinding ? 'Searching…' : 'Find Opponent'}
      </Button>
    </div>
  )
}
