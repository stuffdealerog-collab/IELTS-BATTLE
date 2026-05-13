export interface EssayTopic {
  id: string
  taskType: string
  category: string
  title: string
  prompt: string
  imageDescription: string | null
  createdAt: Date
}

export interface FeedbackData {
  taskAchievement: number
  coherence: number
  lexical: number
  grammar: number
  overallBand: number
  summary: string
  improvements: string[]
  modelParagraph: string
  vocabSuggestions: { word: string; definition: string; example: string }[]
}

export interface Essay {
  id: string
  userId: string | null
  topicId: string
  content: string
  wordCount: number
  isDraft: boolean
  timeTaken: number | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
  topic: EssayTopic
  feedback?: {
    id: string
    taskAchievement: number
    coherence: number
    lexical: number
    grammar: number
    overallBand: number
    detailedFeedback: string
    createdAt: Date
  } | null
}
