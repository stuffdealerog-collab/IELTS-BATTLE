import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { detectAiWriting } from '@/lib/ai-detector'
import { generateAutoFeedback } from '@/lib/auto-feedback'
import { awardXp, updateStreak, XP } from '@/lib/gamification'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const essays = await prisma.essay.findMany({
    where: { userId: session.userId, isDraft: false },
    include: { topic: true, feedback: true },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json({ essays })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicId, content, wordCount, isDraft, timeTaken } = await req.json()
  if (!topicId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const essay = await prisma.essay.create({
    data: {
      userId: session.userId,
      topicId,
      content,
      wordCount: wordCount ?? 0,
      isDraft: isDraft ?? false,
      timeTaken: timeTaken ?? null,
      submittedAt: isDraft ? null : new Date(),
    },
  })

  // Award XP for submission (non-blocking)
  if (!isDraft) {
    awardXp(session.userId, XP.ESSAY_SUBMITTED)
      .then(() => updateStreak(session.userId))
      .catch((e) => console.error('[xp] essay submit:', e))
  }

  // Run AI detection + auto-feedback in background (non-blocking, parallel)
  if (!isDraft && content.trim()) {
    detectAiWriting(content, wordCount ?? 0)
      .then((result) => {
        if (!result) return
        return prisma.essay.update({
          where: { id: essay.id },
          data: {
            aiScore: result.score,
            aiVerdict: result.verdict,
            aiFlags: JSON.stringify(result.flags),
          },
        })
      })
      .catch((err) => console.error(`[ai-detect] essay ${essay.id} failed:`, err))

    generateAutoFeedback(essay.id).catch((err) =>
      console.error(`[auto-feedback] essay ${essay.id} failed:`, err)
    )
  }

  return NextResponse.json({ essayId: essay.id }, { status: 201 })
}
