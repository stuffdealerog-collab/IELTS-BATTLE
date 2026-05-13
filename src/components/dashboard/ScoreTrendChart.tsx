'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface ChartDataPoint {
  date: string
  overall: number
  taskAchievement?: number
  coherence?: number
  lexical?: number
  grammar?: number
}

interface ScoreTrendChartProps {
  data: ChartDataPoint[]
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        No data yet. Submit essays to see your progress.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(val) => {
            try { return format(new Date(val), 'MMM d') } catch { return val }
          }}
        />
        <YAxis domain={[1, 9]} ticks={[1,2,3,4,5,6,7,8,9]} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : String(value))}
          labelFormatter={(label) => {
            try { return format(new Date(label), 'MMM d, yyyy') } catch { return label }
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="overall"
          name="Overall Band"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line type="monotone" dataKey="taskAchievement" name="Task" stroke="#10b981" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="coherence" name="Coherence" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="lexical" name="Lexical" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="grammar" name="Grammar" stroke="#ef4444" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
