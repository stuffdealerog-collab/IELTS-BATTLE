import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { buildFeedbackPrompt } from '@/prompts/feedback'
import type { EssayTopic, FeedbackData } from '@/types'

/**
 * Generates IELTS band scores asynchronously and saves to the Feedback table.
 * Fire-and-forget — called after essay/battle submit so teachers see scores immediately.
 */
export async function generateAutoFeedback(essayId: string): Promise<void> {
  const essay = await prisma.essay.findUnique({
    where: { id: essayId },
    include: { topic: true, feedback: true },
  })
  if (!essay || essay.feedback) return
  if (!essay.content?.trim() || essay.wordCount < 30) return

  const prompt = buildFeedbackPrompt(
    essay.content,
    essay.topic as unknown as EssayTopic,
    essay.wordCount
  )

  const resp = await Promise.race([
    anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auto-feedback timeout')), 60_000)
    ),
  ])

  const block = resp.content.find((c) => c.type === 'text')
  const text = block?.type === 'text' ? block.text : ''
  const match = text.match(/<<<JSON\s*([\s\S]*?)\s*JSON>>>/)
  if (!match) throw new Error('No JSON block in auto-feedback response')

  const scores = JSON.parse(match[1]) as FeedbackData

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
}
