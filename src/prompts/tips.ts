import { EssayTopic } from '@/types'

export function buildTipsPrompt(topic: EssayTopic): string {
  const taskLabel = topic.taskType === 'TASK1' ? 'Task 1' : 'Task 2'
  const minWords = topic.taskType === 'TASK1' ? 150 : 250
  const timeLimit = topic.taskType === 'TASK1' ? '20 minutes' : '40 minutes'

  return `You are an expert IELTS examiner and writing coach. A student is about to write an IELTS Writing ${taskLabel} essay.

Task Type: ${taskLabel}
Category: ${topic.category.replace(/_/g, ' ')}
Topic Title: ${topic.title}
Question: ${topic.prompt}
${topic.imageDescription ? `\nChart/Diagram Description: ${topic.imageDescription}` : ''}

Provide exactly 5 specific, actionable writing tips for THIS particular question. Each tip should be 1–2 sentences.

Focus on:
1. How to structure the response for this specific question type
2. Key vocabulary or phrases useful for this exact topic
3. A common mistake to avoid for this category
4. How to meet the minimum word count (${minWords} words) within ${timeLimit}
5. A specific technique to improve the band score for this task type

Format your response as a numbered list (1. 2. 3. 4. 5.). Be specific and practical — not generic advice.`
}
