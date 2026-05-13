'use client'

import { useState, useEffect } from 'react'
import { countWords } from '@/lib/utils'

export function useWordCount(text: string, debounceMs = 300) {
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWordCount(countWords(text))
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [text, debounceMs])

  return wordCount
}
