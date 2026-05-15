import OpenAI from 'openai'

// Model routing: right model for each task type (cost vs quality tradeoff)
const MODELS = {
  essay_grading: 'anthropic/claude-sonnet-4-6',      // $3/$15 per M — best quality
  quick_feedback: 'google/gemini-flash-1.5',          // $0.075/$0.30 per M — fast, cheap
  ai_detection: 'google/gemini-flash-1.5-8b',         // $0.0375/$0.15 per M — ultra cheap
  reading_gen: 'meta-llama/llama-3.3-70b-instruct',   // free tier available
  bot_essay: 'google/gemini-flash-1.5',               // fast generation, convincing essays
  vocab: 'qwen/qwen2.5-7b-instruct:free',             // free — vocab explanations
  daily_gen: 'google/gemini-flash-1.5',               // daily challenge generation
  placement: 'google/gemini-flash-1.5',               // placement test scoring
} as const

export type ModelTask = keyof typeof MODELS

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://ielts-battle.vercel.app',
    'X-Title': 'IELTS Battle',
  },
})

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function orChat(
  task: ModelTask,
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<string> {
  const { maxTokens = 1000, temperature = 0.7, timeoutMs = 30_000 } = opts

  const completion = await Promise.race([
    client.chat.completions.create({
      model: MODELS[task],
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`OpenRouter timeout: ${task}`)), timeoutMs)
    ),
  ])

  return completion.choices[0]?.message?.content ?? ''
}

export async function orStream(
  task: ModelTask,
  messages: ChatMessage[],
  opts: { maxTokens?: number } = {}
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()
  const stream = await client.chat.completions.create({
    model: MODELS[task],
    messages,
    max_tokens: opts.maxTokens ?? 2000,
    stream: true,
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`))
          }
          if (chunk.choices[0]?.finish_reason === 'stop') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify('[ERROR] AI unavailable')}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })
}
