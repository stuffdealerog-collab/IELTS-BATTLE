import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { buildFeedbackPrompt } from '@/prompts/feedback'
import { FeedbackData, EssayTopic } from '@/types'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { essayId, content, topicId, wordCount } = await req.json()

  if (!essayId || !content || !topicId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const topic = await prisma.essayTopic.findUnique({ where: { id: topicId } })
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  const prompt = buildFeedbackPrompt(content, topic as EssayTopic, wordCount ?? 0)
  const encoder = new TextEncoder()

  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`))
          }
        }

        // Extract and save feedback to DB
        const jsonMatch = fullText.match(/<<<JSON\s*([\s\S]*?)\s*JSON>>>/)
        if (jsonMatch) {
          try {
            const scores = JSON.parse(jsonMatch[1]) as FeedbackData
            await prisma.feedback.upsert({
              where: { essayId },
              create: {
                essayId,
                taskAchievement: scores.taskAchievement,
                coherence: scores.coherence,
                lexical: scores.lexical,
                grammar: scores.grammar,
                overallBand: scores.overallBand,
                detailedFeedback: JSON.stringify(scores),
              },
              update: {
                taskAchievement: scores.taskAchievement,
                coherence: scores.coherence,
                lexical: scores.lexical,
                grammar: scores.grammar,
                overallBand: scores.overallBand,
                detailedFeedback: JSON.stringify(scores),
              },
            })
          } catch {
            // JSON parse error — feedback still streamed to user
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify('[ERROR] AI service unavailable')}\n\n`)
        )
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
