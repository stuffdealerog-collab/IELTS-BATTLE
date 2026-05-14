'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PART_LABELS } from '@/lib/battle-config'

type Mode = 'QUICK' | 'PART' | 'FULL'
type TaskType = 'TASK1' | 'TASK2'

const MODES: {
  id: Mode
  icon: typeof Zap
  label: string
  time: string
  desc: string
  gradient: string
  iconColor: string
}[] = [
  {
    id: 'QUICK',
    icon: Zap,
    label: 'Quick Battle',
    time: '5 min',
    desc: 'One paragraph showdown',
    gradient: 'from-amber-500/15 to-orange-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'PART',
    icon: Target,
    label: 'Part Battle',
    time: '10 min',
    desc: 'Pick a section to compete on',
    gradient: 'from-purple-500/15 to-fuchsia-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'FULL',
    icon: Trophy,
    label: 'Full Battle',
    time: '20–40 min',
    desc: 'Complete IELTS essay',
    gradient: 'from-rose-500/15 to-red-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
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
        router.push(
          `/battle/queue?mode=${mode}&taskType=${taskType}${partType ? `&partType=${partType}` : ''}`
        )
      }
    } catch {
      toast.error('Network error')
      setIsFinding(false)
    }
  }

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-32 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold flex items-center gap-1.5 truncate">
              <Swords className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              Choose Battle Mode
            </h1>
            <p className="text-xs text-muted-foreground truncate">1v1 ranked match</p>
          </div>
        </div>

        {/* Task type tabs */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Task Type
          </p>
          <div className="grid grid-cols-2 gap-2">
            <TabButton
              active={taskType === 'TASK1'}
              onClick={() => setTaskType('TASK1')}
              label="Task 1"
              hint="Charts &amp; diagrams"
            />
            <TabButton
              active={taskType === 'TASK2'}
              onClick={() => setTaskType('TASK2')}
              label="Task 2"
              hint="Essay"
            />
          </div>
        </div>

        {/* Modes */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Battle Length
          </p>
          <div className="space-y-2">
            {MODES.map((m) => {
              const Icon = m.icon
              const selected = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'w-full text-left rounded-2xl p-3.5 flex items-center gap-3 transition-all border-2',
                    selected
                      ? 'border-primary bg-primary/5 elev-1'
                      : 'border-transparent bg-card elev-1'
                  )}
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br',
                      m.gradient
                    )}
                  >
                    <Icon className={cn('w-[22px] h-[22px]', m.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-[15px] leading-tight">{m.label}</h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 gap-0.5 font-medium"
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {m.time}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  {selected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Part selector */}
        {mode === 'PART' && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Choose Part
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['INTRO', 'BODY_1', 'BODY_2', 'CONCLUSION'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPartType(p)}
                  className={cn(
                    'rounded-xl p-3 text-xs font-medium transition-all border-2',
                    partType === p
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-card text-muted-foreground'
                  )}
                >
                  {PART_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Find Opponent button */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 border-t bg-background/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-2xl p-3">
          <Button
            size="lg"
            className="w-full gap-2 h-12 rounded-2xl shadow-lg"
            onClick={handleStart}
            disabled={!mode || isFinding || (mode === 'PART' && !partType)}
          >
            {isFinding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
            {isFinding ? 'Searching…' : 'Find Opponent'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  label: string
  hint: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl p-3 text-left transition-all border-2',
        active
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-card'
      )}
    >
      <p className={cn('text-sm font-semibold leading-none', !active && 'text-muted-foreground')}>
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </button>
  )
}
