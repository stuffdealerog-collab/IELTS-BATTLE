'use client'

import { useState, useCallback, useRef } from 'react'

interface UseStreamingAIOptions {
  onComplete?: (text: string) => void
  onChunk?: (chunk: string) => void
}

export function useStreamingAI(url: string, options: UseStreamingAIOptions = {}) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fullTextRef = useRef('')

  const start = useCallback(
    async (body: Record<string, unknown>) => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      fullTextRef.current = ''
      setText('')
      setError(null)
      setIsLoading(true)

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const raw = decoder.decode(value, { stream: true })
          const lines = raw.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') break
            try {
              const chunk = JSON.parse(payload) as string
              fullTextRef.current += chunk
              setText(fullTextRef.current)
              options.onChunk?.(chunk)
            } catch {
              // skip malformed chunks
            }
          }
        }

        options.onComplete?.(fullTextRef.current)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [url, options]
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setText('')
    setError(null)
    setIsLoading(false)
    fullTextRef.current = ''
  }, [])

  return { text, isLoading, error, start, reset }
}
