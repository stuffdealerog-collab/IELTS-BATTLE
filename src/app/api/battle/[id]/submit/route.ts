import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { publish, battleChannel } from '@/lib/pusher-server'
import { anthropic } from '@/lib/anthropic'
import { buildFeedbackPrompt } from '@/prompts/feedback'
import { EssayTopic, FeedbackData } from '@/types'
import { ratingDelta, computeSpeedBonus, computeFinalScore } from '@/lib/elo'

async function evaluateEssay(content: string, topic: EssayTopic, wordCount: number): Promise<FeedbackData | null> {
  const prompt = buildFeedbackPrompt(content, topic, wordCount)
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = resp.content.find((c) => c.type === 'text')
    const text = block && block.type === 'text' ? block.text : ''
    const match = text.match(/<<<JSON\s*([\s\S]*?)\s*JSON>>>/)
    if (!match) return null
    return JSON.parse(match[1]) as FeedbackData
  } catch {
    return null
  }
}

async function finalizeBattleIfReady(battleId: string) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { participants: { include: { user: true } }, topic: true },
  })
  if (!battle) return
  if (battle.status === 'COMPLETED') return

  const allSubmitted = battle.participants.every((p) => p.submittedAt)
  const timeExpired =
    battle.startedAt &&
    Date.now() - battle.startedAt.getTime() >= battle.timeLimit * 1000

  if (!allSubmitted && !timeExpired) return

  await prisma.battle.update({ where: { id: battleId }, data: { status: 'EVALUATING' } })
  publish(battleChannel(battleId), 'battle-evaluating', {})

  // Evaluate both
  const evals = await Promise.all(
    battle.participants.map(async (p) => {
      if (!p.content.trim()) {
        return { p, feedback: null as FeedbackData | null }
      }
      const fb = await evaluateEssay(p.content, battle.topic as unknown as EssayTopic, p.wordCount)
      return { p, feedback: fb }
    })
  )

  // Compute scores
  const scored = evals.map(({ p, feedback }) => {
    const band = feedback?.overallBand ?? 0
    const timeTakenSec = p.submittedAt && battle.startedAt
      ? Math.floor((p.submittedAt.getTime() - battle.startedAt.getTime()) / 1000)
      : battle.timeLimit
    const speedBonus = feedback ? computeSpeedBonus(timeTakenSec, battle.timeLimit) : 0
    const finalScore = feedback ? computeFinalScore(band, speedBonus) : 0
    return { p, feedback, band, speedBonus, finalScore }
  })

  // Determine winner
  const [a, b] = scored
  let winnerId: string | null = null
  if (a.finalScore > b.finalScore) winnerId = a.p.userId
  else if (b.finalScore > a.finalScore) winnerId = b.p.userId

  // Calculate rating changes
  for (const s of scored) {
    const opp = scored.find((o) => o.p.userId !== s.p.userId)!
    const result = winnerId === null ? 'draw' : winnerId === s.p.userId ? 'win' : 'loss'
    const delta = ratingDelta(s.p.user.rating, opp.p.user.rating, result)

    await prisma.battleParticipant.update({
      where: { battleId_userId: { battleId, userId: s.p.userId } },
      data: {
        bandScore: s.band,
        taskAchievement: s.feedback?.taskAchievement ?? null,
        coherence: s.feedback?.coherence ?? null,
        lexical: s.feedback?.lexical ?? null,
        grammar: s.feedback?.grammar ?? null,
        speedBonus: s.speedBonus,
        finalScore: s.finalScore,
        ratingBefore: s.p.user.rating,
        ratingDelta: delta,
        feedbackJson: s.feedback ? JSON.stringify(s.feedback) : null,
      },
    })

    await prisma.telegramUser.update({
      where: { id: s.p.userId },
      data: {
        rating: { increment: delta },
        wins: result === 'win' ? { increment: 1 } : undefined,
        losses: result === 'loss' ? { increment: 1 } : undefined,
        draws: result === 'draw' ? { increment: 1 } : undefined,
      },
    })
  }

  await prisma.battle.update({
    where: { id: battleId },
    data: { status: 'COMPLETED', endedAt: new Date(), winnerId },
  })

  publish(battleChannel(battleId), 'battle-completed', { winnerId })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { content, wordCount } = await req.json()

  const participant = await prisma.battleParticipant.findUnique({
    where: { battleId_userId: { battleId: id, userId: session.userId } },
    include: { battle: true },
  })
  if (!participant) return NextResponse.json({ error: 'Not in battle' }, { status: 403 })
  if (participant.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  await prisma.battleParticipant.update({
    where: { battleId_userId: { battleId: id, userId: session.userId } },
    data: {
      content: content ?? participant.content,
      wordCount: wordCount ?? participant.wordCount,
      submittedAt: new Date(),
    },
  })

  publish(battleChannel(id), 'opponent-submitted', { userId: session.userId })

  // Trigger finalization (don't await — long task)
  finalizeBattleIfReady(id).catch((e) => console.error('finalize error', e))

  return NextResponse.json({ ok: true })
}
