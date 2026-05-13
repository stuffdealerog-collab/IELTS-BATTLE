import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const taskType = searchParams.get('taskType') ?? undefined
  const category = searchParams.get('category') ?? undefined
  const random = searchParams.get('random') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const where = {
    ...(taskType ? { taskType } : {}),
    ...(category ? { category } : {}),
  }

  if (random) {
    const count = await prisma.essayTopic.count({ where })
    if (count === 0) return NextResponse.json({ topic: null })
    const skip = Math.floor(Math.random() * count)
    const topics = await prisma.essayTopic.findMany({ where, skip, take: 1 })
    return NextResponse.json({ topic: topics[0] })
  }

  const [topics, total] = await Promise.all([
    prisma.essayTopic.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'asc' } }),
    prisma.essayTopic.count({ where }),
  ])

  return NextResponse.json({ topics, total })
}
