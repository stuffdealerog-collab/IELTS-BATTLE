'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BackButton } from '@/components/tma/BackButton'
import { CheckCircle2, GraduationCap, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'

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

  return (
    <div className="min-h-screen p-4 pb-8 space-y-4">
      <BackButton fallbackPath="/" />
      <div className="flex items-center gap-2 pt-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            AI Tutor — Solo Mode
          </h1>
          <p className="text-xs text-muted-foreground">
            Step-by-step lessons with real-time AI feedback
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No lessons available.</p>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => {
            const pct = l.progress
              ? Math.min(((l.progress.completed ? l.stepCount : l.progress.currentStep - 1) / l.stepCount) * 100, 100)
              : 0
            const isCompleted = l.progress?.completed
            const isInProgress = l.progress && !l.progress.completed && l.progress.currentStep > 0

            return (
              <Link href={`/solo/${l.id}`} key={l.id}>
                <Card className="border-0 shadow-sm hover:scale-[0.99] active:scale-[0.98] transition-transform">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-100' : 'bg-emerald-50'}`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <GraduationCap className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            {l.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {l.category.replace(/_/g, ' ')}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-4 px-1.5">
                              ✓ Mastered
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm leading-tight">{l.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {l.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                    </div>

                    {(isCompleted || isInProgress) && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>
                            {isCompleted
                              ? `All ${l.stepCount} steps complete`
                              : `Step ${l.progress!.currentStep} of ${l.stepCount}`}
                          </span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                        <Progress value={pct} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
