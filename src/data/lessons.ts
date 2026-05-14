export interface LessonStepSeed {
  order: number
  partType: 'INTRO' | 'BODY_1' | 'BODY_2' | 'CONCLUSION'
  title: string
  instruction: string
  evaluationCriteria: string
  starter?: string
}

export interface LessonSeed {
  taskType: 'TASK1' | 'TASK2'
  category: string
  title: string
  description: string
  order: number
  steps: LessonStepSeed[]
}

export const lessons: LessonSeed[] = [
  // === TASK 2: OPINION ESSAY ===
  {
    taskType: 'TASK2',
    category: 'OPINION',
    title: 'Opinion Essay (Agree / Disagree)',
    description:
      'Learn the 4-paragraph structure for "to what extent do you agree or disagree" essays.',
    order: 1,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase the question in your own words (1-2 sentences), then state your clear opinion. Use phrases like "It is often argued that...", "In my view...", "I firmly believe that...". 40-60 words.',
        evaluationCriteria:
          'Check: (1) Did they paraphrase the prompt (not copy)? (2) Is the opinion clear? (3) Is it 40-60 words? (4) Vocabulary variety?',
        starter: 'It is often argued that...',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — Main Argument',
        instruction:
          'Present your strongest reason for your opinion. Start with a topic sentence, give an explanation, then provide a specific example. Use connectors like "Firstly", "To begin with", "For instance". 70-90 words.',
        evaluationCriteria:
          'Check: (1) Clear topic sentence? (2) Explanation/reasoning present? (3) Specific real-world example? (4) Logical flow with linkers? (5) 70-90 words?',
        starter: 'Firstly, the main reason I hold this view is that...',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Supporting Argument',
        instruction:
          'Present a second supporting reason. Different angle from Body 1. Topic sentence → reasoning → example. Use "Moreover", "Furthermore", "In addition". 70-90 words.',
        evaluationCriteria:
          'Check: (1) Does it support the same opinion as Body 1 but from a different angle? (2) Has its own example? (3) Distinct from Body 1? (4) 70-90 words?',
        starter: 'Furthermore, another compelling reason is...',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Restate your opinion in different words and briefly summarise both reasons. Do NOT add new ideas. Use "In conclusion", "To sum up". 30-50 words.',
        evaluationCriteria:
          'Check: (1) Restated opinion (not copied)? (2) Summary of reasons? (3) No new ideas? (4) 30-50 words?',
        starter: 'In conclusion,',
      },
    ],
  },

  // === TASK 2: DISCUSSION ===
  {
    taskType: 'TASK2',
    category: 'DISCUSSION',
    title: 'Discussion Essay (Both Views)',
    description:
      'Master "discuss both views and give your opinion" essays with balanced argumentation.',
    order: 2,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase the question, briefly introduce BOTH views, then state which you favour. "While some argue X, others believe Y. In this essay, I will discuss both perspectives and explain why I support..." 50-70 words.',
        evaluationCriteria:
          'Check: (1) Both views mentioned? (2) Own opinion previewed? (3) Paraphrased not copied? (4) 50-70 words?',
        starter: 'There is an ongoing debate about whether...',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — First View',
        instruction:
          'Discuss the view you DON\'T fully agree with, but fairly. Topic sentence → reasoning → example. Stay neutral here. "On the one hand, supporters of X argue that...". 80-100 words.',
        evaluationCriteria:
          'Check: (1) Fair representation of one side? (2) Reasoning + example? (3) Neutral tone? (4) 80-100 words?',
        starter: 'On the one hand, those in favour of...',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Your Preferred View',
        instruction:
          'Discuss the view you agree with. Make it stronger than Body 1. "On the other hand / However, I would argue that...". Topic sentence → strong reasoning → compelling example. 80-100 words.',
        evaluationCriteria:
          'Check: (1) Other view + own stance? (2) Stronger argumentation than Body 1? (3) Specific example? (4) 80-100 words?',
        starter: 'On the other hand, I believe that...',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Acknowledge both views briefly and reaffirm your opinion. "In conclusion, while both views have merit, I believe..." 35-55 words.',
        evaluationCriteria:
          'Check: (1) Both views acknowledged? (2) Final opinion clear? (3) No new ideas? (4) 35-55 words?',
        starter: 'In conclusion, while both views',
      },
    ],
  },

  // === TASK 2: PROBLEM/SOLUTION ===
  {
    taskType: 'TASK2',
    category: 'PROBLEM_SOLUTION',
    title: 'Problem / Solution Essay',
    description:
      'Tackle "what are the causes? what solutions?" questions with a clear 4-paragraph structure.',
    order: 3,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase the issue, then preview that you will explore causes and propose solutions. 45-65 words.',
        evaluationCriteria:
          'Check: (1) Issue paraphrased? (2) Roadmap given (causes + solutions)? (3) 45-65 words?',
        starter: 'In recent years, the issue of...',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — Causes',
        instruction:
          'Discuss 1-2 main causes. Use clear logic. "One of the primary causes is X, because... For example...". 80-100 words.',
        evaluationCriteria:
          'Check: (1) 1-2 specific causes identified? (2) Each cause explained? (3) At least one example? (4) 80-100 words?',
        starter: 'One of the primary causes of this problem is',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Solutions',
        instruction:
          'Propose 1-2 concrete solutions that address the causes. "To tackle this, governments could... Additionally, individuals should...". 80-100 words.',
        evaluationCriteria:
          'Check: (1) Solutions link back to causes from Body 1? (2) Realistic/practical? (3) Specific actors mentioned (govt, schools, individuals)? (4) 80-100 words?',
        starter: 'To address this issue, several measures could be taken.',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Summarise the main cause(s) and key solution(s). End with a forward-looking statement. 35-55 words.',
        evaluationCriteria:
          'Check: (1) Summary of cause + solution? (2) Forward-looking close? (3) No new ideas? (4) 35-55 words?',
        starter: 'In conclusion, although',
      },
    ],
  },

  // === TASK 1: BAR CHART ===
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Bar Chart Description',
    description:
      'Learn the standard 4-paragraph approach to describing bar charts in IELTS Task 1.',
    order: 4,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase what the chart shows: WHAT (variable), WHO (groups), WHEN (time period), WHERE (location). Do NOT use "below shows". 1-2 sentences. 25-40 words.',
        evaluationCriteria:
          'Check: (1) Paraphrased (not copied)? (2) Covers all four W\'s? (3) No data yet? (4) 25-40 words?',
        starter: 'The bar chart illustrates...',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Overview',
        instruction:
          'Write 2 sentences summarising the MAIN TRENDS — no specific numbers. What\'s the biggest/smallest? What\'s the overall pattern? Use "overall", "in general". 30-50 words.',
        evaluationCriteria:
          'Check: (1) 2-3 main trends identified? (2) No specific numbers? (3) Starts with "Overall"/"In general"? (4) 30-50 words?',
        starter: 'Overall, it is clear that',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Detail Paragraph 1',
        instruction:
          'Describe the largest category/group with specific numbers and comparisons. Use comparative language ("the highest", "twice as much"). 50-70 words.',
        evaluationCriteria:
          'Check: (1) Specific numbers/units cited? (2) Comparative language? (3) Focus on biggest features? (4) 50-70 words?',
        starter: 'Looking more closely, it can be seen that',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Detail Paragraph 2',
        instruction:
          'Describe the smaller categories and any notable contrasts or exceptions. Specific numbers + comparisons. Task 1 has NO conclusion — this is just the second detail paragraph. 50-70 words.',
        evaluationCriteria:
          'Check: (1) Remaining data covered? (2) Specific numbers? (3) Contrast highlighted? (4) NO opinion or conclusion? (5) 50-70 words?',
        starter: 'In contrast,',
      },
    ],
  },
]
