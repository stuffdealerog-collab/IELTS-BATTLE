import { EssayTopic } from '@/types'

export function buildFeedbackPrompt(content: string, topic: EssayTopic, wordCount: number): string {
  const taskLabel = topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'

  return `You are an official IELTS examiner. Score the following essay strictly according to the official IELTS Writing band descriptors.

Task: IELTS Writing ${taskLabel}
Category: ${topic.category.replace(/_/g, ' ')}
Question: ${topic.prompt}
${topic.imageDescription ? `\nChart/Diagram Description: ${topic.imageDescription}` : ''}
Word count: ${wordCount}

Student's essay:
---
${content}
---

First, output a JSON block with scores and structured data, then provide detailed prose feedback.

Output the JSON block EXACTLY like this (between <<<JSON and JSON>>> delimiters):

<<<JSON
{
  "taskAchievement": <score 1.0-9.0 in 0.5 increments>,
  "coherence": <score 1.0-9.0 in 0.5 increments>,
  "lexical": <score 1.0-9.0 in 0.5 increments>,
  "grammar": <score 1.0-9.0 in 0.5 increments>,
  "overallBand": <average of above 4, rounded to nearest 0.5>,
  "summary": "<2-3 sentence overall summary of the essay's strengths and weaknesses>",
  "improvements": [
    "<specific improvement point 1>",
    "<specific improvement point 2>",
    "<specific improvement point 3>",
    "<specific improvement point 4>",
    "<specific improvement point 5>"
  ],
  "modelParagraph": "<a model paragraph or sentence that rewrites/improves a weak part of the student's essay>",
  "vocabSuggestions": [
    {"word": "<advanced word/phrase>", "definition": "<meaning>", "example": "<example sentence from essay context>"},
    {"word": "<advanced word/phrase>", "definition": "<meaning>", "example": "<example sentence from essay context>"},
    {"word": "<advanced word/phrase>", "definition": "<meaning>", "example": "<example sentence from essay context>"}
  ]
}
JSON>>>

Then provide detailed prose feedback with these sections:

## Task Achievement / Response (Band X.X)
[Explain the score with specific references to the essay]

## Coherence & Cohesion (Band X.X)
[Explain the score with specific references to the essay]

## Lexical Resource (Band X.X)
[Explain the score with specific references to the essay]

## Grammatical Range & Accuracy (Band X.X)
[Explain the score with specific references to the essay]

## Key Recommendations
[3-5 prioritised, specific things this student should focus on to improve their band score]

Be strict but fair. Use official IELTS band descriptors. Provide specific quotes from the essay to justify scores.`
}
