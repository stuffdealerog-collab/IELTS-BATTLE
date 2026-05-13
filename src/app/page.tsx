import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles, Timer, BarChart3, Target, CheckCircle2 } from 'lucide-react'

export default async function HomePage() {
  const [task1Count, task2Count] = await Promise.all([
    prisma.essayTopic.count({ where: { taskType: 'TASK1' } }),
    prisma.essayTopic.count({ where: { taskType: 'TASK2' } }),
  ])

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-blue-100 text-blue-700 border-0 text-sm px-4 py-1">
            AI-Powered IELTS Training
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Write Smarter,
            <br />
            <span className="text-blue-600">Score Higher</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice IELTS Writing with real exam questions and get instant AI feedback on all four
            band criteria — just like a real examiner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/practice?taskType=TASK2&category=ALL">
              <Button size="lg" className="gap-2 px-8">
                <BookOpen className="w-5 h-5" />
                Start Task 2 Practice
              </Button>
            </Link>
            <Link href="/practice?taskType=TASK1&category=ALL">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <BarChart3 className="w-5 h-5" />
                Task 1 Practice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: task1Count, label: 'Task 1 Topics' },
            { value: task2Count, label: 'Task 2 Topics' },
            { value: '4', label: 'IELTS Criteria' },
            { value: '9', label: 'Band Levels' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-blue-600">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">
            Everything you need to succeed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6 text-blue-500" />,
                title: 'Real Exam Topics',
                desc: `${task1Count + task2Count} authentic IELTS questions across all task types and categories, randomly selected.`,
              },
              {
                icon: <Sparkles className="w-6 h-6 text-purple-500" />,
                title: 'AI Writing Tips',
                desc: 'Get 5 targeted tips for each specific question before you start writing, powered by Claude AI.',
              },
              {
                icon: <Timer className="w-6 h-6 text-amber-500" />,
                title: 'Exam Conditions',
                desc: 'Built-in countdown timer (20 min / 40 min), word counter, and auto-save keep you exam-ready.',
              },
              {
                icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
                title: 'Instant AI Feedback',
                desc: 'Receive band scores on all 4 IELTS criteria with specific improvement suggestions.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-red-500" />,
                title: 'Progress Dashboard',
                desc: 'Track your band score trends over time and identify your weakest criteria.',
              },
              {
                icon: <BookOpen className="w-6 h-6 text-teal-500" />,
                title: 'Vocabulary Bank',
                desc: 'Automatically collect advanced vocabulary from AI feedback to build your word bank.',
              },
            ].map(({ icon, title, desc }) => (
              <Card key={title} className="border-0 shadow-sm">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Task Cards CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-4">
              <Badge className="bg-blue-100 text-blue-700 border-0">Academic &amp; General</Badge>
              <h3 className="text-xl font-bold text-slate-800">Task 1 — Charts &amp; Diagrams</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe bar charts, line graphs, pie charts, tables, maps and processes. {task1Count} topics
                across 7 visual types.
              </p>
              <Link href="/practice?taskType=TASK1&category=ALL">
                <Button className="w-full gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Practice Task 1
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6 space-y-4">
              <Badge className="bg-purple-100 text-purple-700 border-0">Essay Writing</Badge>
              <h3 className="text-xl font-bold text-slate-800">Task 2 — Essays</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Opinion, Discussion, Problem/Solution, Advantages &amp; Disadvantages, and Two-Part questions.{' '}
                {task2Count} real topics.
              </p>
              <Link href="/practice?taskType=TASK2&category=ALL">
                <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                  <BookOpen className="w-4 h-4" />
                  Practice Task 2
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t text-center text-sm text-slate-400">
        IELTS Battle — AI-powered writing practice
      </footer>
    </div>
  )
}
