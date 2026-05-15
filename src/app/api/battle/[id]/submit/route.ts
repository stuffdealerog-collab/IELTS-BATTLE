import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { publish, battleChannel } from '@/lib/pusher-server'
import { orChat } from '@/lib/openrouter'
import { buildFeedbackPrompt } from '@/prompts/feedback'
import { EssayTopic, FeedbackData } from '@/types'
import { ratingDelta, computeSpeedBonus, computeFinalScore } from '@/lib/elo'
import { detectAiWriting } from '@/lib/ai-detector'
import { awardXp, updateStreak, XP } from '@/lib/gamification'

async function evaluateEssay(content: string, topic: EssayTopic, wordCount: number): Promise<FeedbackData | null> {
  const prompt = buildFeedbackPrompt(content, topic, wordCount)
  try {
    const text = await orChat('essay_grading', [{ role: 'user', content: prompt }], { maxTokens: 2000 })
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

  // For bot battles there is only 1 real participant (bot has no row)
  const realParticipants = battle.participants

  const allSubmitted = realParticipants.every((p) => p.submittedAt)
  const timeExpired =
    battle.startedAt &&
    Date.now() - battle.startedAt.getTime() >= battle.timeLimit * 1000

  if (!allSubmitted && !timeExpired) return

  await prisma.battle.update({ where: { id: battleId }, data: { status: 'EVALUATING' } })
  publish(battleChannel(battleId), 'battle-evaluating', {})

  // Evaluate real participants
  const evals = await Promise.all(
    realParticipants.map(async (p) => {
      if (!p.content.trim()) {
        return { p, feedback: null as FeedbackData | null }
      }
      const fb = await evaluateEssay(p.content, battle.topic as unknown as EssayTopic, p.wordCount)
      return { p, feedback: fb }
    })
  )

  // Compute scores for real participants
  const scored = evals.map(({ p, feedback }) => {
    const band = feedback?.overallBand ?? 0
    const timeTakenSec = p.submittedAt && battle.startedAt
      ? Math.floor((p.submittedAt.getTime() - battle.startedAt.getTime()) / 1000)
      : battle.timeLimit
    const speedBonus = feedback ? computeSpeedBonus(timeTakenSec, battle.timeLimit) : 0
    const finalScore = feedback ? computeFinalScore(band, speedBonus) : 0
    return { p, feedback, band, speedBonus, finalScore }
  })

  // For bot battle: compare against bot score from battle record
  let winnerId: string | null = null
  if (battle.isBotBattle && scored.length === 1) {
    const player = scored[0]
    const botScore = battle.botScore ?? 0
    const botFinalScore = computeFinalScore(botScore, 0)
    if (player.finalScore > botFinalScore) winnerId = player.p.userId
    // else bot wins (winnerId stays null to indicate loss for player)

    const result = winnerId === player.p.userId ? 'win' : 'loss'
    const mockBotRating = 1000 + (battle.botBand ?? 6) * 50
    const delta = ratingDelta(player.p.user.rating, mockBotRating, result)

    await prisma.battleParticipant.update({
      where: { battleId_userId: { battleId, userId: player.p.userId } },
      data: {
        bandScore: player.band,
        taskAchievement: player.feedback?.taskAchievement ?? null,
        coherence: player.feedback?.coherence ?? null,
        lexical: player.feedback?.lexical ?? null,
        grammar: player.feedback?.grammar ?? null,
        speedBonus: player.speedBonus,
        finalScore: player.finalScore,
        ratingBefore: player.p.user.rating,
        ratingDelta: delta,
        feedbackJson: player.feedback ? JSON.stringify(player.feedback) : null,
      },
    })

    await prisma.telegramUser.update({
      where: { id: player.p.userId },
      data: {
        rating: { increment: delta },
        wins: result === 'win' ? { increment: 1 } : undefined,
        losses: result === 'loss' ? { increment: 1 } : undefined,
        currentBand: player.band > 0 ? player.band : undefined,
      },
    })

    // Award XP
    const xp = result === 'win' ? XP.BATTLE_WIN : XP.BATTLE_LOSS
    await awardXp(player.p.userId, xp).catch(() => {})
    await updateStreak(player.p.userId).catch(() => {})

    await prisma.battle.update({
      where: { id: battleId },
      data: { status: 'COMPLETED', endedAt: new Date(), winnerId },
    })
    publish(battleChannel(battleId), 'battle-completed', { winnerId, isBotBattle: true, botBand: battle.botBand })
    return
  }

  // Human vs human
  const [a, b] = scored
  if (a.finalScore > b.finalScore) winnerId = a.p.userId
  else if (b && b.finalScore > a.finalScore) winnerId = b.p.userId

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
        currentBand: s.band > 0 ? s.band : undefined,
      },
    })

    // Award XP
    const xp = result === 'win' ? XP.BATTLE_WIN : result === 'loss' ? XP.BATTLE_LOSS : XP.BATTLE_LOSS
    await awardXp(s.p.userId, xp).catch(() => {})
    await updateStreak(s.p.userId).catch(() => {})
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

  // Background AI detection
  const finalContent = content ?? participant.content
  if (finalContent?.trim()) {
    detectAiWriting(finalContent, wordCount ?? participant.wordCount)
      .then((res) => {
        if (!res) return
        return prisma.battleParticipant.update({
          where: { battleId_userId: { battleId: id, userId: session.userId } },
          data: { aiScore: res.score, aiVerdict: res.verdict },
        })
      })
      .catch((err) => {
        console.error(`[ai-detect] battle ${id} user ${session.userId} failed:`, err)
      })
  }

  return NextResponse.json({ ok: true })
}
