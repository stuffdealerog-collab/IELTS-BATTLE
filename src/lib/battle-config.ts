export const BATTLE_MODES = {
  QUICK: { label: 'Quick', timeLimitSec: 5 * 60, description: 'One paragraph, 5 minutes' },
  PART: { label: 'Part', timeLimitSec: 10 * 60, description: 'One section of your choice, 10 minutes' },
  FULL: { label: 'Full', timeLimitSec: 40 * 60, description: 'Complete Task 2 essay, 40 minutes' },
} as const

export const BATTLE_TASK1_TIME = {
  QUICK: 4 * 60,
  PART: 7 * 60,
  FULL: 20 * 60,
} as const

export const PART_TYPES = ['INTRO', 'BODY_1', 'BODY_2', 'CONCLUSION'] as const
export const PART_LABELS: Record<string, string> = {
  INTRO: 'Introduction',
  BODY_1: 'Body Paragraph 1',
  BODY_2: 'Body Paragraph 2',
  CONCLUSION: 'Conclusion',
}

export const BATTLE_MIN_WORDS = {
  QUICK: 50,
  PART: 70,
  FULL: { TASK1: 150, TASK2: 250 },
} as const

export function getBattleMinWords(mode: string, taskType: string): number {
  if (mode === 'QUICK') return BATTLE_MIN_WORDS.QUICK
  if (mode === 'PART') return BATTLE_MIN_WORDS.PART
  return BATTLE_MIN_WORDS.FULL[taskType as 'TASK1' | 'TASK2']
}

export function getBattleTimeLimit(mode: string, taskType: string): number {
  if (mode === 'FULL') {
    return taskType === 'TASK1' ? BATTLE_TASK1_TIME.FULL : BATTLE_MODES.FULL.timeLimitSec
  }
  if (mode === 'PART') return BATTLE_MODES.PART.timeLimitSec
  return BATTLE_MODES.QUICK.timeLimitSec
}
