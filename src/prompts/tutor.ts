export interface TutorContext {
  lessonTitle: string
  taskType: string
  category: string
  stepTitle: string
  stepOrder: number
  totalSteps: number
  instruction: string
  starter?: string | null
  essaySoFar: string
  topicTitle?: string
  topicPrompt?: string
  topicImageDescription?: string | null
}

export function buildTutorIntroPrompt(ctx: TutorContext): string {
  return `You are a warm, encouraging IELTS writing tutor. The student just opened a lesson.

Lesson: ${ctx.lessonTitle} (${ctx.taskType.replace('TASK', 'Task ')} - ${ctx.category.replace(/_/g, ' ')})
Current step: ${ctx.stepOrder}/${ctx.totalSteps} — ${ctx.stepTitle}

Step instruction for the student:
${ctx.instruction}

Greet the student briefly (1 sentence), then explain this step's goal in 2-3 short sentences. Be specific to ${ctx.category.replace(/_/g, ' ')} essays. End with: "Take your time and write your attempt below.${ctx.starter ? ' Here\'s a starter: "' + ctx.starter + '..."' : ''}"

Keep the whole response under 100 words. Use a friendly, mentor-like tone. Plain text, no markdown headers.`
}

export interface TutorEvalContext extends TutorContext {
  studentAttempt: string
  evaluationCriteria: string
  attemptNumber: number
}

export function buildTutorEvaluatePrompt(ctx: TutorEvalContext): string {
  const topicBlock = ctx.topicPrompt
    ? `\nESSAY TOPIC (the prompt the student is responding to):\n"""\n${ctx.topicPrompt}\n"""\n${
        ctx.topicImageDescription
          ? `\nChart/Image description (Task 1 only):\n"""\n${ctx.topicImageDescription}\n"""\n`
          : ''
      }`
    : ''

  return `You are an IELTS writing tutor evaluating a student's attempt at one part of an essay.

Lesson: ${ctx.lessonTitle}${topicBlock}
Step: ${ctx.stepTitle} (${ctx.stepOrder}/${ctx.totalSteps})
Step's instruction was: ${ctx.instruction}

What to check:
${ctx.evaluationCriteria}
- Critically: does the student's writing actually address the ESSAY TOPIC above? Flag any off-topic answer.

${ctx.essaySoFar ? `Essay built so far:\n${ctx.essaySoFar}\n\n` : ''}Student's attempt for this step:
"""
${ctx.studentAttempt}
"""

This is attempt #${ctx.attemptNumber}.

Respond ONLY with a valid JSON object in this exact shape (no markdown, no prose around it):
{
  "score": <integer 1-5, where 5=mastered, 4=good, 3=acceptable, 2=needs work, 1=poor>,
  "passed": <true if score >= 3 else false>,
  "encouragement": "<one short sentence of warm encouragement>",
  "strengths": "<1-2 specific things they did well — quote from their text>",
  "improvements": "<1-2 specific suggestions, with example wording they could use>",
  "nextAction": "<if passed: 'Great work! Let's move on.' or similar. If not passed: 'Try rewriting with the suggestions above.'>"
}

Be kind but honest. Quote specific phrases from the student's text. Keep each field concise (max 2 sentences).`
}
