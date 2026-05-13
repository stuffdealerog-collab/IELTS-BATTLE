import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { buildAnalyzePrompt } from '@/prompts/analyze'
import { EssayTopic } from '@/types'

export async function POST(req: Request) {
  const { content, topicId, wordCount } = await req.json()

  if (!content || !topicId) {
    return NextResponse.json({ error: 'content and topicId required' }, { status: 400 })
  }

  const topic = await prisma.essayTopic.findUnique({ where: { id: topicId } })
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  const prompt = buildAnalyzePrompt(content, topic as EssayTopic, wordCount ?? 0)
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
