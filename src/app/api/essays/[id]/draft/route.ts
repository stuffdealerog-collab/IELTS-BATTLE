import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { content, wordCount } = await req.json()

  const essay = await prisma.essay.update({
    where: { id },
    data: { content, wordCount: wordCount ?? 0 },
  })

  return NextResponse.json({ essay })
}
