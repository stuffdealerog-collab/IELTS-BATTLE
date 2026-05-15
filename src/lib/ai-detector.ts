import { orChat } from '@/lib/openrouter'

export type AiVerdict = 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI'

export interface AiDetectionResult {
  score: number      // 0-10
  verdict: AiVerdict
  flags: string[]
}

export async function detectAiWriting(
  content: string,
  wordCount: number
): Promise<AiDetectionResult | null> {
  if (wordCount < 30) return null

  const prompt = `Analyze this IELTS essay for signs of AI generation.

Score 0–10: 0=Definitely human, 5=Uncertain, 10=Definitely AI.

Check: absence of personal voice, uniform sentence length, generic evidence ("studies show"), mechanical transitions, no hedging/colloquialisms, overly polished academic register, identical paragraph lengths, topic sentences usable in any essay.

Return ONLY JSON: {"score":<0-10>,"verdict":"LIKELY_HUMAN"|"UNCERTAIN"|"LIKELY_AI","flags":["<reason>",...]}
Use LIKELY_HUMAN if ≤3, UNCERTAIN if 4-6, LIKELY_AI if ≥7.

Essay (${wordCount} words):
"""
${content.slice(0, 2000)}${content.length > 2000 ? '\n[truncated]' : ''}
"""`

  try {
    const text = await orChat(
      'ai_detection',
      [
        {
          role: 'system',
          content:
            'You are an academic integrity expert. Return ONLY valid JSON, no prose or markdown.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300, temperature: 0.1, timeoutMs: 30_000 }
    )
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    const parsed = JSON.parse(text.slice(start, end + 1)) as AiDetectionResult
    return {
      score: Math.min(10, Math.max(0, Number(parsed.score) || 0)),
      verdict: (['LIKELY_HUMAN', 'UNCERTAIN', 'LIKELY_AI'].includes(parsed.verdict)
        ? parsed.verdict
        : 'UNCERTAIN') as AiVerdict,
      flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [],
    }
  } catch (err) {
    console.error('[ai-detector] failed:', err instanceof Error ? err.message : err)
    return null
  }
}
