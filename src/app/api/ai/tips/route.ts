import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { buildTipsPrompt } from '@/prompts/tips'
import { EssayTopic } from '@/types'

export async function POST(req: Request) {
  const { topicId } = await req.json()

  if (!topicId) return NextResponse.json({ error: 'topicId required' }, { status: 400 })

  const topic = await prisma.essayTopic.findUnique({ where: { id: topicId } })
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  const prompt = buildTipsPrompt(topic as EssayTopic)
  const encoder = new TextEncoder()

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
