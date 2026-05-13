'use client'

import { useState, useEffect } from 'react'
import { useStreamingAI } from '@/hooks/useStreamingAI'
import { BandScoreGauge } from './BandScoreGauge'
import { CRITERIA_LABELS } from '@/lib/constants'
import { FeedbackData } from '@/types'
import { Loader2, BookOpen, CheckCircle2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FeedbackReportProps {
  essayId: string
  topicId: string
  content: string
  wordCount: number
  savedFeedback?: {
    taskAchievement: number
    coherence: number
    lexical: number
    grammar: number
    overallBand: number
    detailedFeedback: string
  } | null
}

export function FeedbackReport({
  essayId,
  topicId,
  content,
  wordCount,
  savedFeedback,
}: FeedbackReportProps) {
  const [scores, setScores] = useState<FeedbackData | null>(null)
  const [proseText, setProseText] = useState('')
  const { text, isLoading, error, start } = useStreamingAI('/api/ai/feedback', {
    onChunk: (chunk) => {
      setProseText((prev) => prev + chunk)
    },
  })

  // Load saved feedback or request new
  useEffect(() => {
    if (savedFeedback) {
      try {
        const data = JSON.parse(savedFeedback.detailedFeedback) as FeedbackData
        setScores(data)
        // Build prose from saved data
        setProseText('')
      } catch {
        // Fall through to request new feedback
      }
    } else {
      start({ essayId, content, topicId, wordCount })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Parse JSON scores from streaming text
  useEffect(() => {
    if (!text) return
    const match = text.match(/<<<JSON\s*([\s\S]*?)\s*JSON>>>/)
    if (match) {
      try {
        setScores(JSON.parse(match[1]))
      } catch {
        // wait for more data
      }
    }
  }, [text])

  const displayProse = savedFeedback
    ? null
    : proseText.replace(/<<<JSON[\s\S]*?JSON>>>/g, '').trim()

  const criteriaKeys = ['taskAchievement', 'coherence', 'lexical', 'grammar'] as const

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {isLoading && !scores && (
        <div className="flex items-center gap-3 p-6 bg-purple-50 rounded-xl border border-purple-200">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <div>
            <p className="font-medium text-purple-800">Analyzing your essay...</p>
            <p className="text-sm text-purple-600">Claude is evaluating your writing against IELTS criteria</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
          Failed to generate feedback: {error}
        </div>
      )}

      {/* Overall band score */}
      {scores && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <BandScoreGauge band={scores.overallBand} label="Overall Band Score" size="lg" />
            <div className="flex-1 space-y-2">
              <p className="text-slate-700 text-sm leading-relaxed">{scores.summary}</p>
            </div>
          </div>

          {/* 4 Criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Criteria Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {criteriaKeys.map((key) => (
                <BandScoreGauge
                  key={key}
                  band={scores[key]}
                  label={CRITERIA_LABELS[key]}
                />
              ))}
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Key Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scores.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Model paragraph */}
          {scores.modelParagraph && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Model Paragraph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed italic bg-blue-50 rounded-lg p-4 border border-blue-200">
                  "{scores.modelParagraph}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vocab */}
          {scores.vocabSuggestions?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vocabulary to Learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scores.vocabSuggestions.map((v, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {v.word}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{v.definition}</p>
                    <p className="text-xs text-slate-600 italic">"{v.example}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Prose feedback (streamed) */}
      {displayProse && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detailed Examiner Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-slate-700">
              {displayProse.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h3 key={i} className="font-semibold text-slate-800 mt-4 mb-2 text-sm">
                      {line.slice(3)}
                    </h3>
                  )
                }
                if (line.trim() === '') return <div key={i} className="h-2" />
                return (
                  <p key={i} className="text-sm leading-relaxed m-0">
                    {line}
                  </p>
                )
              })}
              {isLoading && (
                <span className="inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5" />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
