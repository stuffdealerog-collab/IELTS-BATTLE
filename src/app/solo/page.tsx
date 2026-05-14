'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BackButton } from '@/components/tma/BackButton'
import {
  CheckCircle2,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface LessonItem {
  id: string
  taskType: string
  category: string
  title: string
  description: string
  stepCount: number
  progress: { currentStep: number; completed: boolean } | null
}

export default function SoloPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lesson')
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons ?? []))
      .finally(() => setLoading(false))
  }, [])

  const completedCount = lessons.filter((l) => l.progress?.completed).length

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold flex items-center gap-1.5 truncate">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Solo Mode
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Step-by-step writing lessons with AI feedback
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white elev-2">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base leading-tight">AI Writing Coach</h2>
              <p className="text-[11px] text-white/85 leading-snug mt-0.5">
                Real IELTS topics, instant feedback on every paragraph
              </p>
            </div>
            {lessons.length > 0 && (
              <div className="text-right shrink-0">
                <p className="text-xl font-bold leading-none">
                  {completedCount}/{lessons.length}
                </p>
                <p className="text-[10px] text-white/80 mt-0.5">Mastered</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading lessons…</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <div className="text-4xl">📚</div>
            <p className="text-sm text-muted-foreground">No lessons available yet.</p>
            <p className="text-xs text-muted-foreground">
              The database needs to be seeded.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lessons.map((l) => {
              const pct = l.progress
                ? Math.min(
                    ((l.progress.completed
                      ? l.stepCount
                      : l.progress.currentStep - 1) /
                      l.stepCount) *
                      100,
                    100
                  )
                : 0
              const isCompleted = l.progress?.completed
              const isInProgress =
                l.progress && !l.progress.completed && l.progress.currentStep > 0

              return (
                <Link href={`/solo/${l.id}`} key={l.id} className="block group">
                  <div className="rounded-2xl bg-card p-3.5 elev-1 group-active:scale-[0.99] transition-transform space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <GraduationCap className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5 font-medium"
                          >
                            {l.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 font-medium"
                          >
                            {l.category.replace(/_/g, ' ')}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] h-4 px-1.5">
                              ✓ Mastered
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-[14px] leading-tight">
                          {l.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">
                          {l.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1.5" />
                    </div>

                    {(isCompleted || isInProgress) && (
                      <div className="space-y-1 pl-13">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>
                            {isCompleted
                              ? `All ${l.stepCount} steps complete`
                              : `Step ${l.progress!.currentStep} of ${l.stepCount}`}
                          </span>
                          <span className="font-semibold">{Math.round(pct)}%</span>
                        </div>
                        <Progress value={pct} className="h-1" />
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
