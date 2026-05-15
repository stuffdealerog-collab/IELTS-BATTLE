import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { detectAiWriting } from '@/lib/ai-detector'

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
  const { topicId, content, wordCount, isDraft, timeTaken } = await req.json()

  if (!topicId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const essay = await prisma.essay.create({
    data: {
      userId: session?.userId ?? null,
      topicId,
      content,
      wordCount: wordCount ?? 0,
      isDraft: isDraft ?? false,
      timeTaken: timeTaken ?? null,
      submittedAt: isDraft ? null : new Date(),
    },
  })

  // Run AI detection in background (non-blocking)
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
      .catch(() => {})
  }

  return NextResponse.json({ essayId: essay.id }, { status: 201 })
}
