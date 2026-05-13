'use client'

import { useState, useEffect, useRef } from 'react'

export function useAutoSave(essayId: string | null, content: string, wordCount: number, debounceMs = 2000) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const prevContentRef = useRef(content)

  useEffect(() => {
    if (!essayId || content === prevContentRef.current) return

    const timer = setTimeout(async () => {
      setIsSaving(true)
      try {
        await fetch(`/api/essays/${essayId}/draft`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, wordCount }),
        })
        prevContentRef.current = content
        setLastSaved(new Date())
      } catch {
        // silent fail on auto-save
      } finally {
        setIsSaving(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [essayId, content, wordCount, debounceMs])

  return { isSaving, lastSaved }
}
