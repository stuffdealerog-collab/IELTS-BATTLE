import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const battle = await prisma.battle.findUnique({
    where: { id },
    include: {
      topic: true,
      participants: { include: { user: true } },
    },
  })
  if (!battle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const me = battle.participants.find((p) => p.userId === session.userId)
  if (!me) return NextResponse.json({ error: 'Not in this battle' }, { status: 403 })

  const opponent = battle.participants.find((p) => p.userId !== session.userId)

  return NextResponse.json({
    battle: {
      id: battle.id,
      status: battle.status,
      mode: battle.mode,
      partType: battle.partType,
      timeLimit: battle.timeLimit,
      startedAt: battle.startedAt,
      endedAt: battle.endedAt,
      winnerId: battle.winnerId,
      topic: battle.topic,
    },
    me: {
      content: me.content,
      wordCount: me.wordCount,
      submittedAt: me.submittedAt,
      bandScore: me.bandScore,
      finalScore: me.finalScore,
      ratingDelta: me.ratingDelta,
    },
    opponent: opponent
      ? {
          username: opponent.user.username,
          firstName: opponent.user.firstName,
          photoUrl: opponent.user.photoUrl,
          rating: opponent.user.rating,
          wordCount: opponent.wordCount,
          submitted: !!opponent.submittedAt,
          bandScore: battle.status === 'COMPLETED' ? opponent.bandScore : null,
          finalScore: battle.status === 'COMPLETED' ? opponent.finalScore : null,
          ratingDelta: battle.status === 'COMPLETED' ? opponent.ratingDelta : null,
        }
      : null,
  })
}
