import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart'
import { EssayHistoryTable } from '@/components/dashboard/EssayHistoryTable'
import { BandScoreGauge } from '@/components/ai/BandScoreGauge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CRITERIA_LABELS } from '@/lib/constants'
import { BookOpen, TrendingUp, Target, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const essays = await prisma.essay.findMany({
    where: { userId: session.userId, isDraft: false },
    include: { topic: true, feedback: true },
    orderBy: { submittedAt: 'desc' },
  })

  const submittedWithFeedback = essays.filter((e) => e.feedback)

  // Chart data
  const chartData = [...submittedWithFeedback]
    .reverse()
    .map((e) => ({
      date: e.submittedAt?.toISOString().split('T')[0] ?? '',
      overall: e.feedback!.overallBand,
      taskAchievement: e.feedback!.taskAchievement,
      coherence: e.feedback!.coherence,
      lexical: e.feedback!.lexical,
      grammar: e.feedback!.grammar,
    }))

  // Averages
  const avg = (key: string): number => {
    if (submittedWithFeedback.length === 0) return 0
    const vals = submittedWithFeedback.map((e) => ((e.feedback as unknown) as Record<string, number>)[key] ?? 0)
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const criteriaAvgs = {
    taskAchievement: avg('taskAchievement'),
    coherence: avg('coherence'),
    lexical: avg('lexical'),
    grammar: avg('grammar'),
    overallBand: avg('overallBand'),
  }

  const weakestCriteria =
    submittedWithFeedback.length > 0
      ? Object.entries(criteriaAvgs)
          .filter(([k]) => k !== 'overallBand')
          .sort(([, a], [, b]) => a - b)[0]
      : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {submittedWithFeedback.length > 0
              ? `${submittedWithFeedback.length} essays submitted`
              : 'No essays yet — start practicing!'}
          </p>
        </div>
        <Link href="/practice">
          <Button className="gap-2">
            <BookOpen className="w-4 h-4" />
            Practice Now
          </Button>
        </Link>
      </div>

      {submittedWithFeedback.length === 0 ? (
        <div className="text-center py-20 text-slate-400 space-y-3">
          <Target className="w-12 h-12 mx-auto text-slate-200" />
          <p className="font-medium">No results yet</p>
          <p className="text-sm">Submit your first essay to see your progress here.</p>
          <Link href="/practice">
            <Button className="mt-2">Start Practicing</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="pt-4">
                <BandScoreGauge
                  band={criteriaAvgs.overallBand}
                  label="Avg Overall"
                  size="lg"
                />
              </CardContent>
            </Card>
            {(['taskAchievement', 'coherence', 'lexical', 'grammar'] as const).map((key) => (
              <Card key={key}>
                <CardContent className="pt-4">
                  <BandScoreGauge band={criteriaAvgs[key]} label={CRITERIA_LABELS[key]} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weak area alert */}
          {weakestCriteria && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 text-sm">Focus area</p>
                <p className="text-sm text-amber-700">
                  Your weakest criterion is{' '}
                  <strong>{CRITERIA_LABELS[weakestCriteria[0]]}</strong> (avg{' '}
                  {weakestCriteria[1].toFixed(1)}). Prioritise this in your next essay.
                </p>
              </div>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart data={chartData} />
            </CardContent>
          </Card>

          {/* History table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Essay History</CardTitle>
            </CardHeader>
            <CardContent>
              <EssayHistoryTable essays={essays as any} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
