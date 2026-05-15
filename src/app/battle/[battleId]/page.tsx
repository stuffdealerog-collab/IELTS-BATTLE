import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { BattleArena } from '@/components/battle/BattleArena'

interface PageProps {
  params: Promise<{ battleId: string }>
}

export default async function BattlePage({ params }: PageProps) {
  const { battleId } = await params
  const session = await getSession()
  if (!session) redirect('/')

  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      topic: true,
      participants: { include: { user: true } },
    },
  })
  if (!battle) notFound()

  const me = battle.participants.find((p) => p.userId === session.userId)
  if (!me) notFound()

  if (battle.status === 'COMPLETED') redirect(`/battle/${battleId}/results`)

  const opp = battle.participants.find((p) => p.userId !== session.userId)

  const botOpponent = battle.isBotBattle
    ? {
        username: null as string | null,
        firstName: `AI Bot (Band ${battle.botBand?.toFixed(1) ?? '?'})` as string | null,
        photoUrl: null as string | null,
        rating: 1000 + Math.round((battle.botBand ?? 6) * 50),
        wordCount: 0,
        submitted: !!battle.botEssay,
        isBot: true,
      }
    : null

  return (
    <BattleArena
      battle={{
        id: battle.id,
        status: battle.status,
        mode: battle.mode,
        partType: battle.partType,
        timeLimit: battle.timeLimit,
        startedAt: battle.startedAt!.toISOString(),
        topic: battle.topic,
        isBotBattle: battle.isBotBattle,
      }}
      initialOpponent={
        botOpponent ??
        (opp
          ? {
              username: opp.user.username,
              firstName: opp.user.firstName,
              photoUrl: opp.user.photoUrl,
              rating: opp.user.rating,
              wordCount: opp.wordCount,
              submitted: !!opp.submittedAt,
            }
          : null)
      }
    />
  )
}
