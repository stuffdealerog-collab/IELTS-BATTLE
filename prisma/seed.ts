import { PrismaClient } from '@prisma/client'
import { task1Topics } from '../src/data/task1-topics'
import { task2Topics } from '../src/data/task2-topics'
import { lessons } from '../src/data/lessons'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Topics
  await prisma.essayTopic.deleteMany()
  const allTopics = [...task1Topics, ...task2Topics]
  for (const topic of allTopics) {
    await prisma.essayTopic.create({
      data: {
        taskType: topic.taskType,
        category: topic.category,
        title: topic.title,
        prompt: topic.prompt,
        imageDescription: topic.imageDescription ?? null,
      },
    })
  }
  console.log(`✓ ${allTopics.length} topics (${task1Topics.length} Task 1, ${task2Topics.length} Task 2)`)

  // Lessons
  await prisma.lessonStep.deleteMany()
  await prisma.lesson.deleteMany()
  for (const lesson of lessons) {
    const created = await prisma.lesson.create({
      data: {
        taskType: lesson.taskType,
        category: lesson.category,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
      },
    })
    for (const step of lesson.steps) {
      await prisma.lessonStep.create({
        data: {
          lessonId: created.id,
          order: step.order,
          partType: step.partType,
          title: step.title,
          instruction: step.instruction,
          evaluationCriteria: step.evaluationCriteria,
          starter: step.starter ?? null,
          vocabBank: step.vocabBank ? JSON.stringify(step.vocabBank) : null,
          grammarTip: step.grammarTip ?? null,
          modelAnswer: step.modelAnswer ?? null,
        },
      })
    }
  }
  console.log(`✓ ${lessons.length} lessons (${lessons.reduce((a, l) => a + l.steps.length, 0)} steps)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
