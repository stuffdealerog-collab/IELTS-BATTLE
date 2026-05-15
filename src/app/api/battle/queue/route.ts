import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { publish, battleChannel } from '@/lib/pusher-server'
import { getBattleTimeLimit } from '@/lib/battle-config'
import { createBotBattle } from '@/lib/bot-battle'

const BOT_WAIT_SECONDS = 15  // match with bot after this many seconds in queue

interface QueueBody {
  mode: 'QUICK' | 'PART' | 'FULL'
  taskType: 'TASK1' | 'TASK2'
  partType?: string | null
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as QueueBody
  if (!body.mode || !body.taskType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const user = await prisma.telegramUser.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Already in a battle?
  const activeParticipation = await prisma.battleParticipant.findFirst({
    where: { userId: user.id, battle: { status: { in: ['WAITING', 'ACTIVE'] } } },
    include: { battle: true },
  })
  if (activeParticipation) {
    return NextResponse.json({ battleId: activeParticipation.battleId, joined: true })
  }

  // Find opponent
  const opponent = await prisma.matchmakingQueue.findFirst({
    where: {
      mode: body.mode,
      taskType: body.taskType,
      partType: body.partType ?? null,
      userId: { not: user.id },
    },
    orderBy: { rating: 'asc' },
  })

  if (opponent) {
    // Match found — create battle
    await prisma.matchmakingQueue.deleteMany({ where: { userId: { in: [user.id, opponent.userId] } } })

    // Pick random topic matching task type
    const topics = await prisma.essayTopic.findMany({ where: { taskType: body.taskType } })
    if (topics.length === 0) {
      return NextResponse.json({ error: 'No topics available' }, { status: 500 })
    }
    const topic = topics[Math.floor(Math.random() * topics.length)]

    const timeLimit = getBattleTimeLimit(body.mode, body.taskType)
    const battle = await prisma.battle.create({
      data: {
        topicId: topic.id,
        mode: body.mode,
        partType: body.partType ?? null,
        status: 'ACTIVE',
        timeLimit,
        startedAt: new Date(),
        participants: {
          create: [
            { userId: user.id },
            { userId: opponent.userId },
          ],
        },
      },
      include: { participants: { include: { user: true } } },
    })

    // Notify both clients via Pusher
    publish(battleChannel(battle.id), 'battle-start', {
      battleId: battle.id,
      topicId: topic.id,
      timeLimit,
      startedAt: battle.startedAt,
    })

    // Tell the opponent that's still on queue page that match is found
    publish(`user-${opponent.userId}`, 'match-found', { battleId: battle.id })
    publish(`user-${user.id}`, 'match-found', { battleId: battle.id })

    return NextResponse.json({ battleId: battle.id, matched: true })
  }

  // Check if user has been waiting long enough for a bot battle
  const existingEntry = await prisma.matchmakingQueue.findUnique({ where: { userId: user.id } })
  const waitSecs = existingEntry
    ? (Date.now() - existingEntry.enqueuedAt.getTime()) / 1000
    : 0

  if (existingEntry && waitSecs >= BOT_WAIT_SECONDS) {
    // Match with bot
    await prisma.matchmakingQueue.deleteMany({ where: { userId: user.id } })
    const { battleId, botName, botBand } = await createBotBattle({
      userId: user.id,
      mode: body.mode,
      taskType: body.taskType,
      partType: body.partType ?? undefined,
      rating: user.rating,
      userBand: user.currentBand,
    })
    publish(`user-${user.id}`, 'match-found', { battleId, isBot: true, botName, botBand })
    return NextResponse.json({ battleId, matched: true, isBot: true, botName, botBand })
  }

  // No opponent — add to queue
  await prisma.matchmakingQueue.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mode: body.mode,
      taskType: body.taskType,
      partType: body.partType ?? null,
      rating: user.rating,
    },
    update: {
      mode: body.mode,
      taskType: body.taskType,
      partType: body.partType ?? null,
      rating: user.rating,
      enqueuedAt: new Date(),
    },
  })

  return NextResponse.json({ queued: true, botWaitSecs: BOT_WAIT_SECONDS })
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.matchmakingQueue.deleteMany({ where: { userId: session.userId } })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entry = await prisma.matchmakingQueue.findUnique({ where: { userId: session.userId } })

  // Check if a battle was already created for this user
  const activeBattle = await prisma.battleParticipant.findFirst({
    where: { userId: session.userId, battle: { status: { in: ['ACTIVE', 'EVALUATING', 'COMPLETED'] } } },
    orderBy: { battle: { createdAt: 'desc' } },
    include: { battle: true },
  })

  return NextResponse.json({
    inQueue: !!entry,
    activeBattleId:
      activeBattle && activeBattle.battle.status === 'ACTIVE' ? activeBattle.battleId : null,
    matchedBattleId: activeBattle?.battleId ?? null,
  })
}
