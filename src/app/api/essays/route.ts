import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const essays = await prisma.essay.findMany({
    where: { userId: session.user.id, isDraft: false },
    include: { topic: true, feedback: true },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json({ essays })
}

export async function POST(req: Request) {
  const session = await auth()
  const { topicId, content, wordCount, isDraft, timeTaken } = await req.json()

  if (!topicId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const essay = await prisma.essay.create({
    data: {
      userId: session?.user?.id ?? null,
      topicId,
      content,
      wordCount: wordCount ?? 0,
      isDraft: isDraft ?? false,
      timeTaken: timeTaken ?? null,
      submittedAt: isDraft ? null : new Date(),
    },
  })

  return NextResponse.json({ essayId: essay.id }, { status: 201 })
}
