import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { publish, battleChannel } from '@/lib/pusher-server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { content, wordCount } = await req.json()

  const participant = await prisma.battleParticipant.findUnique({
    where: { battleId_userId: { battleId: id, userId: session.userId } },
  })
  if (!participant) return NextResponse.json({ error: 'Not in battle' }, { status: 403 })
  if (participant.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  await prisma.battleParticipant.update({
    where: { battleId_userId: { battleId: id, userId: session.userId } },
    data: { content: content ?? '', wordCount: wordCount ?? 0 },
  })

  publish(battleChannel(id), 'opponent-progress', {
    userId: session.userId,
    wordCount: wordCount ?? 0,
  })

  return NextResponse.json({ ok: true })
}
