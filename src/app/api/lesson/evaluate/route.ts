import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/jwt'
import { buildTutorEvaluatePrompt } from '@/prompts/tutor'

interface EvalResult {
  score: number
  passed: boolean
  encouragement: string
  strengths: string
  improvements: string
  nextAction: string
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, stepId, attempt, attemptNumber = 1 } = await req.json()
  if (!lessonId || !stepId || !attempt) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const [lesson, step, progress] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: lessonId }, include: { steps: true } }),
    prisma.lessonStep.findUnique({ where: { id: stepId } }),
    prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
      include: { topic: true },
    }),
  ])

  if (!lesson || !step) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = buildTutorEvaluatePrompt({
    lessonTitle: lesson.title,
    taskType: lesson.taskType,
    category: lesson.category,
    stepTitle: step.title,
    stepOrder: step.order,
    totalSteps: lesson.steps.length,
    instruction: step.instruction,
    starter: step.starter,
    essaySoFar: progress?.essayDraft ?? '',
    studentAttempt: attempt,
    evaluationCriteria: step.evaluationCriteria,
    attemptNumber,
    topicTitle: progress?.topic?.title,
    topicPrompt: progress?.topic?.prompt,
    topicImageDescription: progress?.topic?.imageDescription ?? null,
  })

  let resultText = ''
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = resp.content.find((c) => c.type === 'text')
    resultText = block && block.type === 'text' ? block.text : ''
  } catch (e) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }

  // Extract JSON
  let parsed: EvalResult
  try {
    const match = resultText.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : resultText)
  } catch {
    return NextResponse.json({ error: 'Could not parse evaluation' }, { status: 502 })
  }

  // Update progress on pass
  if (parsed.passed) {
    const nextStepOrder = step.order + 1
    const isLastStep = step.order === lesson.steps.length
    const newDraft = (progress?.essayDraft ?? '') + (progress?.essayDraft ? '\n\n' : '') + attempt

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
      create: {
        userId: session.userId,
        lessonId,
        currentStep: isLastStep ? step.order : nextStepOrder,
        completed: isLastStep,
        completedAt: isLastStep ? new Date() : null,
        essayDraft: newDraft,
      },
      update: {
        currentStep: isLastStep ? step.order : nextStepOrder,
        completed: isLastStep,
        completedAt: isLastStep ? new Date() : null,
        essayDraft: newDraft,
      },
    })
  } else if (!progress) {
    // Create progress record on first attempt even if not passed
    await prisma.lessonProgress.create({
      data: { userId: session.userId, lessonId, currentStep: step.order },
    })
  }

  return NextResponse.json({ evaluation: parsed })
}
