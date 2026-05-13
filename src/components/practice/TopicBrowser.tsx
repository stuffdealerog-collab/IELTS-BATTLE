'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EssayTopic } from '@/types'
import { TopicCard } from './TopicCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TASK_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import { Shuffle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TopicBrowserProps {
  topics: EssayTopic[]
  total: number
  taskType: string
  category: string
}

export function TopicBrowser({ topics, total, taskType, category }: TopicBrowserProps) {
  const router = useRouter()
  const [isRandom, startRandom] = useTransition()

  const handleTaskTypeChange = (value: string) => {
    router.push(`/practice?taskType=${value}&category=ALL`)
  }

  const handleCategoryChange = (value: string) => {
    router.push(`/practice?taskType=${taskType}&category=${value}`)
  }

  const handleRandom = async () => {
    startRandom(async () => {
      try {
        const params = new URLSearchParams()
        params.set('random', 'true')
        if (taskType !== 'ALL') params.set('taskType', taskType)
        if (category !== 'ALL') params.set('category', category)

        const res = await fetch(`/api/topics?${params}`)
        const { topic } = await res.json()
        if (topic) {
          router.push(`/practice/${topic.id}`)
        } else {
          toast.error('No topics found with this filter')
        }
      } catch {
        toast.error('Failed to get random topic')
      }
    })
  }

  const categories =
    taskType === 'TASK1'
      ? TASK_CATEGORIES.TASK1
      : taskType === 'TASK2'
      ? TASK_CATEGORIES.TASK2
      : [...TASK_CATEGORIES.TASK1, ...TASK_CATEGORIES.TASK2]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={taskType} onValueChange={handleTaskTypeChange}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="TASK1">Task 1</TabsTrigger>
            <TabsTrigger value="TASK2">Task 2</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleRandom} disabled={isRandom} className="gap-2">
          {isRandom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
          Random Topic
        </Button>

        <span className="text-sm text-slate-400 ml-auto">{total} topics</span>
      </div>

      {/* Grid */}
      {topics.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No topics found for this filter.</p>
          <Button variant="link" onClick={() => router.push('/practice?taskType=ALL&category=ALL')}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
