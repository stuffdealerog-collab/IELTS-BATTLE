export const MIN_WORDS = {
  TASK1: 150,
  TASK2: 250,
} as const

export const TIME_LIMITS = {
  TASK1: 20 * 60,
  TASK2: 40 * 60,
} as const

export const TASK_CATEGORIES = {
  TASK1: ['BAR_CHART', 'LINE_GRAPH', 'PIE_CHART', 'TABLE', 'MAP', 'PROCESS', 'MIXED_CHART'],
  TASK2: ['OPINION', 'DISCUSSION', 'PROBLEM_SOLUTION', 'ADVANTAGES_DISADVANTAGES', 'TWO_PART'],
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  BAR_CHART: 'Bar Chart',
  LINE_GRAPH: 'Line Graph',
  PIE_CHART: 'Pie Chart',
  TABLE: 'Table',
  MAP: 'Map',
  PROCESS: 'Process',
  MIXED_CHART: 'Mixed Chart',
  OPINION: 'Opinion',
  DISCUSSION: 'Discussion',
  PROBLEM_SOLUTION: 'Problem / Solution',
  ADVANTAGES_DISADVANTAGES: 'Advantages & Disadvantages',
  TWO_PART: 'Two-Part Question',
}

export const BAND_DESCRIPTORS: Record<number, string> = {
  9: 'Expert User',
  8: 'Very Good User',
  7: 'Good User',
  6: 'Competent User',
  5: 'Modest User',
  4: 'Limited User',
  3: 'Extremely Limited User',
  2: 'Intermittent User',
  1: 'Non User',
}

export const CRITERIA_LABELS: Record<string, string> = {
  taskAchievement: 'Task Achievement',
  coherence: 'Coherence & Cohesion',
  lexical: 'Lexical Resource',
  grammar: 'Grammatical Range & Accuracy',
}
