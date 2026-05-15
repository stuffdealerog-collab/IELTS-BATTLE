'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/tma/BackButton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Flame,
  Star,
  CheckCircle2,
  Loader2,
  BookOpen,
  PenLine,
  AlignLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useTMA } from '@/components/tma/TMAProvider'

interface WordItem {
  word: string
  definition: string
  example: string
  synonyms: string[]
}

interface ReadingQuestion {
  q: string
  options: string[]
  answer: string
  explanation: string
}

interface ChallengeData {
  // WRITING_SPRINT
  title?: string
  task?: string
  tip?: string
  targetWords?: number
  // VOCAB
  words?: WordItem[]
  // READING_SNIPPET
  passage?: string
  questions?: ReadingQuestion[]
}

interface Challenge {
  id: string
  type: 'WRITING_SPRINT' | 'VOCAB' | 'READING_SNIPPET'
  date: string
  completed: boolean
  xpReward: number
  data: ChallengeData
}

const TYPE_META = {
  WRITING_SPRINT: { icon: PenLine, label: 'Writing Sprint', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
  VOCAB: { icon: BookOpen, label: 'Vocabulary', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  READING_SNIPPET: { icon: AlignLeft, label: 'Reading', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
}

export default function DailyPage() {
  const router = useRouter()
  const { user, refreshUser } = useTMA()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Writing sprint state
  const [essay, setEssay] = useState('')
  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length

  // Reading state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showExplanations, setShowExplanations] = useState(false)

  // Vocab state
  const [vocabDone, setVocabDone] = useState(false)
  const [vocabWriting, setVocabWriting] = useState('')

  useEffect(() => {
    fetch('/api/daily')
      .then((r) => r.json())
      .then((d) => {
        setChallenge(d.challenge)
        setStreak(d.streak ?? 0)
      })
      .catch(() => toast.error('Failed to load daily challenge'))
      .finally(() => setLoading(false))
  }, [])

  const complete = async () => {
    if (!challenge || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id }),
      })
      const data = await res.json()
      if (data.already) {
        toast.info('Already completed today!')
        return
      }
      toast.success(`+${data.xpReward} XP earned! 🎉`)
      setChallenge((c) => c ? { ...c, completed: true } : c)
      setStreak(data.streak ?? streak)
      await refreshUser()
    } catch {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const canComplete = (() => {
    if (!challenge || challenge.completed) return false
    if (challenge.type === 'WRITING_SPRINT') {
      return wordCount >= (challenge.data.targetWords ?? 80)
    }
    if (challenge.type === 'READING_SNIPPET') {
      return Object.keys(selectedAnswers).length === (challenge.data.questions?.length ?? 0)
    }
    if (challenge.type === 'VOCAB') return vocabDone
    return false
  })()

  if (loading) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-muted-foreground">No challenge available. Try again later.</p>
        <button onClick={() => router.push('/')} className="text-sm text-primary underline">
          Go Home
        </button>
      </div>
    )
  }

  const meta = TYPE_META[challenge.type]
  const Icon = meta.icon

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)] bg-background">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-28 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Daily Challenge
            </h1>
            <p className="text-xs text-muted-foreground">{challenge.date}</p>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-500">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">+{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Challenge Card */}
        <div className={`rounded-2xl border p-4 space-y-3 ${meta.bg}`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${meta.color}`} />
            <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
            {challenge.completed && (
              <Badge variant="outline" className="ml-auto text-emerald-600 border-emerald-600/30 bg-emerald-600/10 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </Badge>
            )}
          </div>

          {challenge.data.title && (
            <h2 className="text-base font-bold leading-snug">{challenge.data.title}</h2>
          )}

          {/* WRITING SPRINT */}
          {challenge.type === 'WRITING_SPRINT' && (
            <WritingSprint
              challenge={challenge}
              essay={essay}
              setEssay={setEssay}
              wordCount={wordCount}
            />
          )}

          {/* VOCAB */}
          {challenge.type === 'VOCAB' && (
            <VocabChallenge
              challenge={challenge}
              vocabWriting={vocabWriting}
              setVocabWriting={setVocabWriting}
              vocabDone={vocabDone}
              setVocabDone={setVocabDone}
            />
          )}

          {/* READING SNIPPET */}
          {challenge.type === 'READING_SNIPPET' && (
            <ReadingSnippet
              challenge={challenge}
              selectedAnswers={selectedAnswers}
              setSelectedAnswers={setSelectedAnswers}
              showExplanations={showExplanations}
              setShowExplanations={setShowExplanations}
            />
          )}
        </div>

        {/* Complete Button */}
        {!challenge.completed && (
          <button
            onClick={complete}
            disabled={!canComplete || submitting}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: canComplete
                ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                : undefined,
              backgroundColor: canComplete ? undefined : 'hsl(var(--muted))',
              color: canComplete ? 'white' : undefined,
            }}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Star className="w-5 h-5" />
                Complete & Earn {challenge.xpReward} XP
              </>
            )}
          </button>
        )}

        {challenge.completed && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Challenge Complete!</p>
            <p className="text-xs text-muted-foreground">Come back tomorrow for a new challenge</p>
            {streak > 0 && (
              <p className="text-sm font-semibold text-orange-500 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" /> {streak} day streak!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Writing Sprint ──────────────────────────────────────────────────────────

function WritingSprint({
  challenge,
  essay,
  setEssay,
  wordCount,
}: {
  challenge: Challenge
  essay: string
  setEssay: (v: string) => void
  wordCount: number
}) {
  const target = challenge.data.targetWords ?? 100
  const pct = Math.min(100, Math.round((wordCount / target) * 100))

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">{challenge.data.task}</p>
      {challenge.data.tip && (
        <div className="bg-background/60 rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Tip: </span>
            {challenge.data.tip}
          </p>
        </div>
      )}
      {!challenge.completed && (
        <>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Start writing here…"
            className="w-full min-h-[180px] bg-background/60 border border-border/50 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 leading-relaxed"
          />
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span>Target: {target}</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        </>
      )}
    </div>
  )
}

// ── Vocab Challenge ─────────────────────────────────────────────────────────

function VocabChallenge({
  challenge,
  vocabWriting,
  setVocabWriting,
  vocabDone,
  setVocabDone,
}: {
  challenge: Challenge
  vocabWriting: string
  setVocabWriting: (v: string) => void
  vocabDone: boolean
  setVocabDone: (v: boolean) => void
}) {
  const words = challenge.data.words ?? []

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {words.map((w, i) => (
          <div key={i} className="bg-background/60 rounded-xl p-3 border border-border/50 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm">{w.word}</span>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
                {w.synonyms?.slice(0, 2).join(', ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{w.definition}</p>
            <p className="text-xs italic text-foreground/70">&ldquo;{w.example}&rdquo;</p>
          </div>
        ))}
      </div>

      {challenge.data.task && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{challenge.data.task}</p>
          {!challenge.completed && (
            <>
              <textarea
                value={vocabWriting}
                onChange={(e) => setVocabWriting(e.target.value)}
                placeholder="Write your sentences using the vocabulary above…"
                className="w-full min-h-[100px] bg-background/60 border border-border/50 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
              />
              {!vocabDone && vocabWriting.trim().length > 20 && (
                <button
                  onClick={() => setVocabDone(true)}
                  className="text-xs text-blue-500 underline"
                >
                  Mark as written ✓
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Reading Snippet ─────────────────────────────────────────────────────────

function ReadingSnippet({
  challenge,
  selectedAnswers,
  setSelectedAnswers,
  showExplanations,
  setShowExplanations,
}: {
  challenge: Challenge
  selectedAnswers: Record<number, string>
  setSelectedAnswers: (v: Record<number, string>) => void
  showExplanations: boolean
  setShowExplanations: (v: boolean) => void
}) {
  const questions = challenge.data.questions ?? []
  const allAnswered = Object.keys(selectedAnswers).length === questions.length

  const score = questions.filter((q, i) => selectedAnswers[i] === q.answer).length

  return (
    <div className="space-y-4">
      <div className="bg-background/60 rounded-xl p-3 border border-border/50">
        <p className="text-sm leading-relaxed">{challenge.data.passage}</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-medium">
              {i + 1}. {q.q}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt) => {
                const letter = opt.split(':')[0].trim()
                const isSelected = selectedAnswers[i] === letter
                const isCorrect = letter === q.answer
                const revealed = showExplanations || (challenge.completed && isSelected)

                let cls =
                  'w-full text-left px-3 py-2 rounded-xl border text-sm transition-all '
                if (revealed && isCorrect) {
                  cls += 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                } else if (revealed && isSelected && !isCorrect) {
                  cls += 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                } else if (isSelected) {
                  cls += 'bg-primary/10 border-primary/30 text-primary'
                } else {
                  cls += 'bg-background/60 border-border/50 hover:bg-muted/50 active:scale-[0.98]'
                }

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (!challenge.completed)
                        setSelectedAnswers({ ...selectedAnswers, [i]: letter })
                    }}
                    className={cls}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {showExplanations && q.explanation && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {allAnswered && !challenge.completed && (
        <button
          onClick={() => setShowExplanations(true)}
          className="text-xs text-emerald-500 underline"
        >
          Show explanations ({score}/{questions.length} correct)
        </button>
      )}
    </div>
  )
}
