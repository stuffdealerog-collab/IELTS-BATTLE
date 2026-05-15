import { orChat } from '@/lib/openrouter'
import { prisma } from '@/lib/prisma'

const BOT_NAMES = [
  'Alex_Bot', 'Sam_AI', 'IELTSbot', 'WriterBot', 'BandBot', 'AceWriter',
  'ProScribe', 'BandMaster', 'EssayAI', 'WriteMind',
]

export function getBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]
}

/**
 * Generate a bot essay at specified band level for a given topic.
 * Uses Gemini Flash for speed + cost efficiency.
 */
export async function generateBotEssay(
  topicPrompt: string,
  taskType: 'TASK1' | 'TASK2',
  targetBand: number,
  timeLimit: number
): Promise<{ content: string; wordCount: number }> {
  const targetWords = taskType === 'TASK1' ? 165 : 265
  const bandDesc: Record<number, string> = {
    5: 'limited vocabulary, repetitive grammar, addresses topic partially, some errors',
    5.5: 'adequate vocabulary, mix of simple and complex sentences, mostly on topic, some errors',
    6: 'adequate vocabulary with some errors, attempts complex structures, relevant ideas',
    6.5: 'good vocabulary range, mostly accurate grammar, clear position, minor errors',
    7: 'varied vocabulary with good collocations, complex grammar mostly accurate, well-organized',
    7.5: 'wide vocabulary range, very few errors, sophisticated structures, cohesive',
    8: 'precise vocabulary, rare errors, complex structures, highly coherent and cohesive',
  }

  const bandLevel = Math.round(targetBand * 2) / 2
  const desc = bandDesc[bandLevel] ?? bandDesc[7]

  const prompt = `Write an IELTS Writing ${taskType === 'TASK1' ? 'Task 1' : 'Task 2'} essay at band ${targetBand} level.

Quality level: ${desc}

Topic: ${topicPrompt}

Requirements:
- Exactly ${targetWords}-${targetWords + 30} words
- Natural ${taskType === 'TASK1' ? 'academic report' : 'opinion/discussion essay'} style
- Match the band ${targetBand} characteristics precisely
- Do NOT make it too perfect — match the quality description exactly

Write ONLY the essay, no intro or explanation.`

  const content = await orChat(
    'bot_essay',
    [{ role: 'user', content: prompt }],
    { maxTokens: 600, temperature: 0.8, timeoutMs: 20_000 }
  )

  const words = content.trim().split(/\s+/).filter(Boolean)
  return { content: content.trim(), wordCount: words.length }
}

/**
 * Score a bot essay using the auto-feedback system.
 * Returns overall band score.
 */
export async function scoreBotEssay(
  content: string,
  topicPrompt: string,
  taskType: string
): Promise<number> {
  const prompt = `Score this IELTS Writing essay. Return ONLY a JSON object: {"band": <1.0-9.0>}

Task type: ${taskType}
Topic: ${topicPrompt}

Essay:
${content}`

  try {
    const text = await orChat(
      'quick_feedback',
      [{ role: 'user', content: prompt }],
      { maxTokens: 50, temperature: 0.1, timeoutMs: 15_000 }
    )
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return 6.0
    const parsed = JSON.parse(match[0]) as { band: number }
    return Math.min(9, Math.max(1, parsed.band))
  } catch {
    return 6.0
  }
}

/**
 * Determine bot difficulty based on user's estimated band / rating.
 */
export function botDifficulty(userRating: number, userBand?: number | null): number {
  if (userBand) {
    // Match ±0.5 band, slightly below to keep it winnable
    return Math.max(5.0, Math.min(8.0, userBand - 0.5 + Math.random()))
  }
  // Fall back to rating-based estimate
  if (userRating >= 1400) return 7.0
  if (userRating >= 1300) return 6.5
  if (userRating >= 1200) return 6.0
  return 5.5
}

/**
 * Create a bot battle when no real opponent is found.
 */
export async function createBotBattle(params: {
  userId: string
  mode: string
  taskType: string
  partType?: string
  rating: number
  userBand?: number | null
}): Promise<{ battleId: string; botName: string; botBand: number }> {
  const { userId, mode, taskType, partType, rating, userBand } = params

  const botBand = botDifficulty(rating, userBand)
  const botName = getBotName()

  // Pick a random topic matching taskType
  const topicCount = await prisma.essayTopic.count({ where: { taskType } })
  const topic = await prisma.essayTopic.findFirst({
    where: { taskType },
    skip: Math.floor(Math.random() * topicCount),
  })
  if (!topic) throw new Error('No topics found for bot battle')

  const timeLimit =
    mode === 'QUICK' ? 20 * 60 : mode === 'PART' ? 30 * 60 : 40 * 60

  const battle = await prisma.battle.create({
    data: {
      topicId: topic.id,
      mode,
      partType: partType ?? null,
      status: 'IN_PROGRESS',
      timeLimit,
      startedAt: new Date(),
      isBotBattle: true,
      botBand,
      participants: {
        create: {
          userId,
          ratingBefore: rating,
        },
      },
    },
  })

  // Generate bot essay in background
  generateBotEssay(topic.prompt, taskType as 'TASK1' | 'TASK2', botBand, timeLimit)
    .then(async ({ content, wordCount }) => {
      const botScore = await scoreBotEssay(content, topic.prompt, taskType)
      await prisma.battle.update({
        where: { id: battle.id },
        data: { botEssay: content, botScore },
      })
    })
    .catch((err) => console.error(`[bot-battle] essay gen failed:`, err))

  return { battleId: battle.id, botName, botBand }
}
