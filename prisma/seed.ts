import { PrismaClient } from '@prisma/client'
import { task1Topics } from '../src/data/task1-topics'
import { task2Topics } from '../src/data/task2-topics'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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

  console.log(`Seeded ${allTopics.length} topics (${task1Topics.length} Task 1, ${task2Topics.length} Task 2)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
