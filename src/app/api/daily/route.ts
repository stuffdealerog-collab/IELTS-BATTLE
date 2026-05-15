import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { orChat } from '@/lib/openrouter'
import { awardXp, updateStreak } from '@/lib/gamification'

const today = () => new Date().toISOString().slice(0, 10)

const CHALLENGE_TYPES = ['WRITING_SPRINT', 'VOCAB', 'READING_SNIPPET'] as const
type ChallengeType = (typeof CHALLENGE_TYPES)[number]

async function generateChallenge(type: ChallengeType, userBand: number | null): Promise<string> {
  const band = userBand ?? 6.0
  const prompts: Record<ChallengeType, string> = {
    WRITING_SPRINT: `Generate a short IELTS Writing sprint challenge for band ${band} level student.
Return JSON: {"title":"<8 words>","task":"<the writing prompt, 1-2 sentences>","tip":"<one specific grammar/vocab tip for this task>","targetWords":100}`,
    VOCAB: `Generate a vocabulary challenge for IELTS band ${band} student.
Return JSON: {"title":"<title>","words":[{"word":"<word>","definition":"<def>","example":"<ielts context sentence>","synonyms":["<s1>","<s2>"]}],"task":"Use these 3 words to write 2 sentences about [relevant IELTS topic]"}
Include exactly 3 words.`,
    READING_SNIPPET: `Generate a mini IELTS Reading challenge for band ${band} student.
Return JSON: {"title":"<title>","passage":"<80-100 word academic paragraph>","questions":[{"q":"<question>","options":["A: <opt>","B: <opt>","C: <opt>","D: <opt>"],"answer":"A|B|C|D","explanation":"<why>"}]}
Include exactly 2 MCQ questions.`,
  }

  const text = await orChat(
    'daily_gen',
    [
      { role: 'system', content: 'Return ONLY valid JSON, no markdown, no prose.' },
      { role: 'user', content: prompts[type] },
    ],
    { maxTokens: 600, temperature: 0.9, timeoutMs: 20_000 }
  )

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Bad JSON from challenge generator')
  return text.slice(start, end + 1)
}

// GET — get or create today's challenge
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.telegramUser.findUnique({
    where: { id: session.userId },
    select: { currentBand: true, streak: true, xp: true },
  })

  const dateStr = today()
  let challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: session.userId, date: dateStr } },
  })

  if (!challenge) {
    const type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]
    let prompt: string
    try {
      prompt = await generateChallenge(type, user?.currentBand ?? null)
    } catch {
      // Fallback static challenge
      prompt = JSON.stringify({
        title: 'Daily Writing Sprint',
        task: 'Some universities now offer online courses instead of face-to-face teaching. Do you think this is a positive or negative development?',
        tip: 'Use "argue that" instead of "think that" for a more academic tone.',
        targetWords: 100,
      })
    }
    challenge = await prisma.dailyChallenge.create({
      data: {
        userId: session.userId,
        date: dateStr,
        type,
        prompt,
        xpReward: 50,
      },
    })
  }

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      type: challenge.type,
      date: challenge.date,
      completed: challenge.completed,
      xpReward: challenge.xpReward,
      data: JSON.parse(challenge.prompt),
    },
    streak: user?.streak ?? 0,
    xp: user?.xp ?? 0,
  })
}

// POST — mark challenge as completed
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId } = await req.json()
  if (!challengeId) return NextResponse.json({ error: 'challengeId required' }, { status: 400 })

  const challenge = await prisma.dailyChallenge.findUnique({ where: { id: challengeId } })
  if (!challenge || challenge.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (challenge.completed) {
    return NextResponse.json({ already: true, xpReward: 0 })
  }

  await prisma.dailyChallenge.update({
    where: { id: challengeId },
    data: { completed: true, completedAt: new Date() },
  })

  await awardXp(session.userId, challenge.xpReward)
  const streak = await updateStreak(session.userId)

  return NextResponse.json({ ok: true, xpReward: challenge.xpReward, streak })
}
