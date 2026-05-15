import { orChat } from '@/lib/openrouter'
import { prisma } from '@/lib/prisma'
import { buildFeedbackPrompt } from '@/prompts/feedback'
import type { EssayTopic, FeedbackData } from '@/types'

/**
 * Generates IELTS band scores via OpenRouter (claude-sonnet for quality).
 * Fire-and-forget after essay/battle submit.
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

  const text = await orChat(
    'essay_grading',
    [{ role: 'user', content: prompt }],
    { maxTokens: 3000, timeoutMs: 60_000 }
  )

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
