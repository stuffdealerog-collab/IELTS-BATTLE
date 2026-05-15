'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTMA } from '@/components/tma/TMAProvider'
import { BackButton } from '@/components/tma/BackButton'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  Users,
  Loader2,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Trophy,
  Calendar,
  GraduationCap,
  PenLine,
  Swords,
} from 'lucide-react'
import { toast } from 'sonner'

interface Classroom {
  id: string
  name: string
  code: string
  description: string | null
  teacherName: string
  teacherPhoto: string | null
  memberCount: number
  joinedAt: string
}

interface EssayRow {
  id: string
  topicTitle: string
  taskType: string
  wordCount: number
  submittedAt: string | null
  aiVerdict: 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI' | null
  aiScore: number | null
  band: number | null
  taskAchievement: number | null
  coherence: number | null
  lexical: number | null
  grammar: number | null
}

const verdictMeta: Record<
  'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI',
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  LIKELY_HUMAN: {
    label: 'Authentic',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  UNCERTAIN: {
    label: 'Uncertain',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: HelpCircle,
  },
  LIKELY_AI: {
    label: 'AI-like',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertTriangle,
  },
}

export default function MyClassPage() {
  const router = useRouter()
  const { user, isLoading } = useTMA()
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [essays, setEssays] = useState<EssayRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/')
      return
    }
    fetch('/api/student/my-class')
      .then(async (r) => {
        if (!r.ok) {
          toast.error('Failed to load class')
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        if (!d.classroom) {
          router.replace('/join')
          return
        }
        setClassroom(d.classroom)
        setEssays(d.essays ?? [])
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setLoading(false))
  }, [isLoading, user, router])

  if (loading) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!classroom) return null

  const avgBand =
    essays.filter((e) => e.band !== null).reduce((a, e) => a + (e.band ?? 0), 0) /
    (essays.filter((e) => e.band !== null).length || 1)
  const totalEssays = essays.length
  const reviewedCount = essays.filter((e) => e.band !== null).length

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">My Class</h1>
            <p className="text-xs text-muted-foreground truncate">{classroom.name}</p>
          </div>
        </div>

        {/* Classroom card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 text-white elev-2">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex items-center gap-3">
              {classroom.teacherPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={classroom.teacherPhoto}
                  alt={classroom.teacherName}
                  className="w-11 h-11 rounded-full ring-2 ring-white/30 object-cover shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-yellow-200" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-white/70">Teacher</p>
                <p className="font-bold text-base leading-tight">{classroom.teacherName}</p>
              </div>
            </div>
            {classroom.description && (
              <p className="text-xs text-white/85 leading-snug">{classroom.description}</p>
            )}
            <div className="flex items-center gap-4 text-[11px] text-white/85">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {classroom.memberCount} students
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(classroom.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-card p-2.5 text-center elev-1">
            <p className="text-base font-bold leading-none">{totalEssays}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              Essays
            </p>
          </div>
          <div className="rounded-xl bg-card p-2.5 text-center elev-1">
            <p className="text-base font-bold leading-none">
              {reviewedCount > 0 ? avgBand.toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              Avg Band
            </p>
          </div>
          <div className="rounded-xl bg-card p-2.5 text-center elev-1">
            <p className="text-base font-bold leading-none">{reviewedCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              Reviewed
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/practice?taskType=ALL&category=ALL"
            className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border bg-card hover:bg-secondary/50 transition-colors elev-1"
          >
            <PenLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-semibold">Practice</span>
          </Link>
          <Link
            href="/solo"
            className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border bg-card hover:bg-secondary/50 transition-colors elev-1"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold">Solo</span>
          </Link>
          <Link
            href="/battle"
            className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border bg-card hover:bg-secondary/50 transition-colors elev-1"
          >
            <Swords className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[11px] font-semibold">Battle</span>
          </Link>
        </div>

        {/* My essays */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            My submissions ({totalEssays})
          </p>
          {essays.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No essays yet.</p>
              <p className="text-xs text-muted-foreground">
                Write your first essay — your teacher will see it here.
              </p>
              <Link
                href="/practice?taskType=ALL&category=ALL"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                <PenLine className="w-3 h-3" />
                Start writing
              </Link>
            </div>
          ) : (
            essays.map((e) => {
              const vd = e.aiVerdict ? verdictMeta[e.aiVerdict] : null
              return (
                <Link
                  key={e.id}
                  href={`/results/${e.id}`}
                  className="block rounded-2xl bg-card elev-1 p-3.5 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-medium leading-snug line-clamp-2">
                        {e.topicTitle}
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {e.taskType === 'TASK1' ? 'Task 1' : 'Task 2'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {e.wordCount}w
                        </span>
                        {e.band ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-[10px] h-4 px-1.5 gap-0.5">
                            <Trophy className="w-2.5 h-2.5" />
                            Band {e.band.toFixed(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                            Scoring…
                          </Badge>
                        )}
                        {vd && (
                          <Badge className={`border-0 text-[10px] h-4 px-1.5 gap-0.5 ${vd.cls}`}>
                            <vd.icon className="w-2.5 h-2.5" />
                            {vd.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground pt-2">
          Your teacher sees all your essays with AI-generated band scores.
        </p>
      </div>
    </div>
  )
}
