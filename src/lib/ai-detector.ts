import { anthropic } from '@/lib/anthropic'

export type AiVerdict = 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI'

export interface AiDetectionResult {
  score: number      // 0-10
  verdict: AiVerdict
  flags: string[]
}

const SYSTEM = `You are an academic integrity expert who detects AI-generated writing.
Analyze essays for signs of AI vs human authorship. Return ONLY valid JSON — no prose.`

export async function detectAiWriting(
  content: string,
  wordCount: number
): Promise<AiDetectionResult | null> {
  if (wordCount < 30) return null

  const prompt = `Analyze this IELTS essay for signs of AI generation.

Score 0–10:
0 = Definitely human (personal voice, natural imperfections, idiosyncratic examples)
5 = Uncertain
10 = Definitely AI (formulaic, generic, suspiciously perfect)

AI indicators to check:
1. Absence of genuine personal opinions or locally-specific examples
2. Overly uniform sentence length and parallel structure throughout
3. Generic/unverifiable evidence ("studies show", "research suggests" without specifics)
4. Mechanical transitions that feel copy-pasted (Firstly… Furthermore… In conclusion…)
5. No hedging, colloquialisms, or natural hesitations
6. Academic register too polished for a test-taker's level
7. Every paragraph exactly the same length
8. Topic sentences that could appear in any essay on this topic

Return ONLY this JSON:
{"score": <0-10>, "verdict": "LIKELY_HUMAN"|"UNCERTAIN"|"LIKELY_AI", "flags": ["<reason>", ...]}

Use "LIKELY_HUMAN" if score ≤ 3, "UNCERTAIN" if 4-6, "LIKELY_AI" if ≥ 7.

Essay (${wordCount} words):
"""
${content.slice(0, 2000)}${content.length > 2000 ? '\n[truncated]' : ''}
"""`

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = resp.content.find((c) => c.type === 'text')
    const text = block?.type === 'text' ? block.text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0]) as AiDetectionResult
    return {
      score: Math.min(10, Math.max(0, Number(parsed.score) || 0)),
      verdict: (['LIKELY_HUMAN', 'UNCERTAIN', 'LIKELY_AI'].includes(parsed.verdict)
        ? parsed.verdict
        : 'UNCERTAIN') as AiVerdict,
      flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [],
    }
  } catch {
    return null
  }
}
