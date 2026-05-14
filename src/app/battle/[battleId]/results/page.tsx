import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BandScoreGauge } from '@/components/ai/BandScoreGauge'
import { CRITERIA_LABELS } from '@/lib/constants'
import { PART_LABELS } from '@/lib/battle-config'
import { Trophy, RotateCcw, Home, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ battleId: string }>
}

export default async function BattleResultsPage({ params }: PageProps) {
  const { battleId } = await params
  const session = await getSession()
  if (!session) redirect('/')

  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { participants: { include: { user: true } }, topic: true },
  })
  if (!battle) notFound()
  if (battle.status !== 'COMPLETED') redirect(`/battle/${battleId}`)

  const me = battle.participants.find((p) => p.userId === session.userId)
  const opp = battle.participants.find((p) => p.userId !== session.userId)
  if (!me || !opp) notFound()

  const iWon = battle.winnerId === me.userId
  const isDraw = !battle.winnerId
  const myName = me.user.firstName ?? me.user.username ?? 'You'
  const oppName = opp.user.firstName ?? opp.user.username ?? 'Opponent'

  const resultText = isDraw ? 'Draw' : iWon ? 'Victory!' : 'Defeat'
  const resultEmoji = isDraw ? '🤝' : iWon ? '🏆' : '💪'
  const resultColor = isDraw ? 'text-amber-600' : iWon ? 'text-emerald-600' : 'text-red-600'

  return (
    <div className="min-h-screen p-4 pb-8 space-y-4">
      {/* Hero */}
      <div className="text-center pt-4 space-y-1">
        <div className="text-6xl mb-2">{resultEmoji}</div>
        <h1 className={cn('text-3xl font-bold', resultColor)}>{resultText}</h1>
        <p className="text-sm text-muted-foreground">
          {battle.mode} {battle.topic.taskType.replace('TASK', 'Task ')}
          {battle.partType && ` · ${PART_LABELS[battle.partType]}`}
        </p>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-3">
        <Card className={cn('border-2', iWon && 'border-emerald-300')}>
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {myName}
            </p>
            {me.bandScore !== null && (
              <div>
                <p className="text-4xl font-bold">{me.bandScore!.toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">Band</p>
              </div>
            )}
            <p className="text-xs">Speed: +{me.speedBonus?.toFixed(1) ?? '0'}</p>
            <p
              className={cn(
                'text-sm font-bold',
                (me.ratingDelta ?? 0) > 0 ? 'text-emerald-600' : (me.ratingDelta ?? 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              <Crown className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              {(me.ratingDelta ?? 0) > 0 ? '+' : ''}{me.ratingDelta ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className={cn('border-2', !iWon && !isDraw && 'border-red-300')}>
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {oppName}
            </p>
            {opp.bandScore !== null && (
              <div>
                <p className="text-4xl font-bold">{opp.bandScore!.toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">Band</p>
              </div>
            )}
            <p className="text-xs">Speed: +{opp.speedBonus?.toFixed(1) ?? '0'}</p>
            <p
              className={cn(
                'text-sm font-bold',
                (opp.ratingDelta ?? 0) > 0 ? 'text-emerald-600' : (opp.ratingDelta ?? 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              <Crown className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              {(opp.ratingDelta ?? 0) > 0 ? '+' : ''}{opp.ratingDelta ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My criteria breakdown */}
      {me.bandScore !== null && (
        <Card className="border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Criteria
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['taskAchievement', 'coherence', 'lexical', 'grammar'] as const).map((k) => (
                <div key={k} className="text-center bg-secondary rounded-lg p-2">
                  <p className="text-lg font-bold">{(me[k] ?? 0).toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {CRITERIA_LABELS[k]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My essay */}
      {me.content && (
        <Card className="border-0">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Essay ({me.wordCount} words)
            </p>
            <p className="text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {me.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Link href="/battle">
          <Button variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Rematch
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
      </div>

      <div className="text-center pt-2">
        <Link href="/leaderboard" className="text-xs text-primary inline-flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          View Leaderboard
        </Link>
      </div>
    </div>
  )
}
