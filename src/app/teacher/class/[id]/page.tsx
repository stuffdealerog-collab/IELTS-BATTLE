'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { BackButton } from '@/components/tma/BackButton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  AlertTriangle,
  BookOpen,
  Crown,
  Copy,
  Check,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  firstName: string | null
  username: string | null
  photoUrl: string | null
  rating: number
  joinedAt: string
  essayCount: number
  avgBand: number | null
  aiFlags: number
  lessonProgress: { lessonTitle: string; completed: boolean; currentStep: number }[]
}

interface Classroom {
  id: string
  name: string
  code: string
  description: string | null
  createdAt: string
}

export default function ClassroomPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useTMA()
  const router = useRouter()
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isLoading && user?.role !== 'TEACHER') router.replace('/teacher/register')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!id) return
    fetch(`/api/teacher/classroom/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: 'Failed to load class' }))
          toast.error(error ?? 'Failed to load class')
          if (r.status === 401 || r.status === 403) router.replace('/teacher')
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setClassroom(d.classroom)
        setStudents(d.students ?? [])
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setLoading(false))
  }, [id, router])

  const copyCode = async () => {
    if (!classroom) return
    await navigator.clipboard.writeText(classroom.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Code copied!')
  }

  const aiCols = (aiFlags: number) =>
    aiFlags > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/teacher" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        <div className="flex items-center gap-3 pt-1">
          <Link href="/teacher" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">{classroom?.name ?? 'Classroom'}</h1>
            <p className="text-xs text-muted-foreground">{students.length} students</p>
          </div>
        </div>

        {/* Code banner */}
        {classroom && (
          <div className="rounded-2xl bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900 p-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Join Code</p>
              <p className="font-mono font-bold text-xl tracking-[0.2em] mt-0.5">{classroom.code}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Share this code with students → they open app and tap "Join Class"
              </p>
            </div>
            <button onClick={copyCode} className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No students yet.</p>
            <p className="text-xs text-muted-foreground">Share the join code above with your class.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Students</p>
            {students.map((s) => {
              const name = s.firstName ?? s.username ?? 'Student'
              const lessonsCompleted = s.lessonProgress.filter((p) => p.completed).length
              return (
                <Link
                  key={s.id}
                  href={`/teacher/class/${id}/student/${s.id}`}
                  className="block group"
                >
                  <div className="rounded-2xl bg-card elev-1 p-3.5 flex items-center gap-3 group-active:scale-[0.99] transition-transform">
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold flex items-center justify-center shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm leading-tight truncate">{name}</p>
                        {s.aiFlags > 0 && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] h-4 px-1.5 gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {s.aiFlags} AI flags
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Crown className="w-3 h-3 text-amber-500" />
                          {s.rating}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" />
                          {s.essayCount} essays
                        </span>
                        {s.avgBand && (
                          <span className="flex items-center gap-0.5">
                            <Trophy className="w-3 h-3 text-blue-500" />
                            Avg {s.avgBand.toFixed(1)}
                          </span>
                        )}
                        {lessonsCompleted > 0 && (
                          <span>{lessonsCompleted} lessons ✓</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
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
