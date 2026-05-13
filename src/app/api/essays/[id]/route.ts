import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const essay = await prisma.essay.findUnique({
    where: { id },
    include: { topic: true, feedback: true },
  })
  if (!essay) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ essay })
}
