'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { BackButton } from '@/components/tma/BackButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Crown,
  BookOpen,
  Swords,
  Loader2,
  ChevronDown,
  ChevronUp,
  Send,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type AiVerdict = 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI'

interface Essay {
  id: string
  topicTitle: string
  topicType: string
  wordCount: number
  submittedAt: string | null
  overallBand: number | null
  taskAchievement: number | null
  coherence: number | null
  lexical: number | null
  grammar: number | null
  aiScore: number | null
  aiVerdict: AiVerdict | null
  aiFlags: string[]
  content: string
  teacherNotes: { id: string; note: string; teacherName: string; createdAt: string }[]
}

interface LessonProg {
  lessonId: string
  lessonTitle: string
  taskType: string
  completed: boolean
  currentStep: number
  totalSteps: number
  topicTitle: string | null
}

interface Student {
  id: string
  firstName: string | null
  username: string | null
  photoUrl: string | null
  rating: number
  wins: number
  losses: number
  essays: Essay[]
  lessonProgress: LessonProg[]
  battles: {
    battleId: string
    mode: string
    topicTitle: string
    bandScore: number | null
    ratingDelta: number | null
    aiScore: number | null
    aiVerdict: AiVerdict | null
    createdAt: string
  }[]
}

const verdictBadge: Record<AiVerdict, { label: string; cls: string }> = {
  LIKELY_HUMAN: { label: '✓ Human', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  UNCERTAIN: { label: '⚠ Uncertain', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  LIKELY_AI: { label: '🤖 AI detected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export default function StudentDetailPage() {
  const { id: classroomId, userId } = useParams<{ id: string; userId: string }>()
  const { user, isLoading } = useTMA()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedEssay, setExpandedEssay] = useState<string | null>(null)
  const [noteText, setNoteText] = useState<Record<string, string>>({})
  const [addingNote, setAddingNote] = useState<string | null>(null)
  const [tab, setTab] = useState<'essays' | 'lessons' | 'battles'>('essays')

  useEffect(() => {
    if (!isLoading && user?.role !== 'TEACHER') router.replace('/teacher/register')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!userId || !classroomId) return
    fetch(`/api/teacher/student/${userId}`)
      .then(async (r) => {
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: 'Failed to load student' }))
          toast.error(error ?? 'Failed to load student')
          if (r.status === 401 || r.status === 403) router.replace(`/teacher/class/${classroomId}`)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d) setStudent(d.student ?? null)
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setLoading(false))
  }, [userId, classroomId, router])

  const handleAddNote = async (essayId: string) => {
    const note = noteText[essayId]?.trim()
    if (!note) return
    setAddingNote(essayId)
    try {
      const res = await fetch(`/api/teacher/classroom/${classroomId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId, note }),
      })
      if (!res.ok) throw new Error()
      // Append locally
      setStudent((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          essays: prev.essays.map((e) =>
            e.id === essayId
              ? { ...e, teacherNotes: [...e.teacherNotes, { id: Date.now().toString(), note, teacherName: user?.firstName ?? 'You', createdAt: new Date().toISOString() }] }
              : e
          ),
        }
      })
      setNoteText((prev) => ({ ...prev, [essayId]: '' }))
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setAddingNote(null)
    }
  }

  if (loading || !student) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const name = student.firstName ?? student.username ?? 'Student'
  const withBand = student.essays.filter((e) => e.overallBand)
  const avgBand = withBand.length > 0
    ? (withBand.reduce((s, e) => s + (e.overallBand ?? 0), 0) / withBand.length).toFixed(1)
    : null
  const aiFlags = student.essays.filter((e) => e.aiVerdict === 'LIKELY_AI' || e.aiVerdict === 'UNCERTAIN').length

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath={`/teacher/class/${classroomId}`} />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        {/* Back + header */}
        <div className="flex items-center gap-3 pt-1">
          <Link href={`/teacher/class/${classroomId}`} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {student.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photoUrl} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold flex items-center justify-center shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-base truncate">{name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5"><Crown className="w-3 h-3 text-amber-500" />{student.rating}</span>
                <span>{student.wins}W {student.losses}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Essays" value={student.essays.length} />
          <StatCard label="Avg Band" value={avgBand ?? '—'} />
          <StatCard
            label="AI Flags"
            value={aiFlags}
            highlight={aiFlags > 0}
          />
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-secondary rounded-xl p-1">
          {(['essays', 'lessons', 'battles'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-lg py-1.5 text-xs font-medium transition-colors capitalize',
                tab === t ? 'bg-card shadow-sm' : 'text-muted-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Essays tab */}
        {tab === 'essays' && (
          <div className="space-y-2.5">
            {student.essays.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No essays submitted yet.</div>
            ) : student.essays.map((e) => {
              const isExpanded = expandedEssay === e.id
              const vd = e.aiVerdict ? verdictBadge[e.aiVerdict] : null
              return (
                <div key={e.id} className="rounded-2xl bg-card elev-1 overflow-hidden">
                  <button className="w-full text-left px-3.5 py-3 flex items-start gap-3" onClick={() => setExpandedEssay(isExpanded ? null : e.id)}>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-snug line-clamp-2">{e.topicTitle}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{e.topicType === 'TASK1' ? 'Task 1' : 'Task 2'}</Badge>
                        <span className="text-[10px] text-muted-foreground">{e.wordCount}w</span>
                        {e.overallBand && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-[10px] h-4 px-1.5">
                            Band {e.overallBand.toFixed(1)}
                          </Badge>
                        )}
                        {vd ? (
                          <Badge className={`border-0 text-[10px] h-4 px-1.5 ${vd.cls}`}>{vd.label}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                            AI check pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t px-3.5 py-3 space-y-3">
                      {/* Band scores */}
                      {e.overallBand && (
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            ['TA', e.taskAchievement],
                            ['CC', e.coherence],
                            ['LR', e.lexical],
                            ['GRA', e.grammar],
                          ].map(([label, val]) => (
                            <div key={label as string} className="rounded-lg bg-secondary p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">{label}</p>
                              <p className="text-sm font-bold">{(val as number)?.toFixed(1) ?? '—'}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Analysis */}
                      {e.aiVerdict && (
                        <div className={cn(
                          'rounded-xl p-2.5 space-y-1',
                          e.aiVerdict === 'LIKELY_AI' ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900' :
                          e.aiVerdict === 'UNCERTAIN' ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900' :
                          'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900'
                        )}>
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">AI Detection · Score {e.aiScore?.toFixed(1)}/10</span>
                          </div>
                          {e.aiFlags.length > 0 && (
                            <ul className="text-[11px] text-foreground/80 space-y-0.5 pl-1">
                              {e.aiFlags.map((f, i) => <li key={i}>· {f}</li>)}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Essay content */}
                      <div className="rounded-xl bg-secondary/50 p-2.5 max-h-32 overflow-y-auto">
                        <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{e.content}</p>
                      </div>

                      {/* Teacher notes */}
                      {e.teacherNotes.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Your Notes</p>
                          {e.teacherNotes.map((n) => (
                            <div key={n.id} className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 p-2">
                              <p className="text-xs">{n.note}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add note */}
                      <div className="flex gap-2">
                        <input
                          value={noteText[e.id] ?? ''}
                          onChange={(ev) => setNoteText((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                          placeholder="Add a note for this essay…"
                          className="flex-1 rounded-xl border bg-secondary/50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(ev) => ev.key === 'Enter' && handleAddNote(e.id)}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="shrink-0 rounded-xl w-9 h-9"
                          disabled={addingNote === e.id || !noteText[e.id]?.trim()}
                          onClick={() => handleAddNote(e.id)}
                        >
                          {addingNote === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Lessons tab */}
        {tab === 'lessons' && (
          <div className="space-y-2.5">
            {student.lessonProgress.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No lessons started yet.</div>
            ) : student.lessonProgress.map((p) => {
              const pct = Math.min((p.completed ? p.totalSteps : p.currentStep - 1) / p.totalSteps * 100, 100)
              return (
                <div key={p.lessonId} className="rounded-2xl bg-card elev-1 p-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${p.completed ? 'bg-emerald-500/15' : 'bg-blue-500/10'}`}>
                      {p.completed ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> : <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{p.lessonTitle}</p>
                      {p.topicTitle && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">Topic: {p.topicTitle}</p>}
                    </div>
                    {p.completed && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-4 px-1.5 shrink-0">Done</Badge>}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{p.completed ? 'Complete' : `Step ${p.currentStep} / ${p.totalSteps}`}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Battles tab */}
        {tab === 'battles' && (
          <div className="space-y-2.5">
            {student.battles.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No battles yet.</div>
            ) : student.battles.map((b) => {
              const vd = b.aiVerdict ? verdictBadge[b.aiVerdict] : null
              return (
                <div key={b.battleId} className="rounded-2xl bg-card elev-1 p-3 flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                    <Swords className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{b.topicTitle}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">{b.mode}</Badge>
                      {b.bandScore && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-[10px] h-4 px-1.5">Band {b.bandScore.toFixed(1)}</Badge>}
                      {b.ratingDelta != null && (
                        <span className={`text-[10px] font-semibold ${b.ratingDelta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {b.ratingDelta >= 0 ? '+' : ''}{b.ratingDelta}
                        </span>
                      )}
                      {vd && <Badge className={`border-0 text-[10px] h-4 px-1.5 ${vd.cls}`}>{vd.label}</Badge>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-xl bg-card p-2.5 text-center elev-1', highlight && Number(value) > 0 && 'ring-1 ring-amber-400')}>
      <p className={cn('text-base font-bold leading-none', highlight && Number(value) > 0 && 'text-amber-600')}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
    </div>
  )
}
