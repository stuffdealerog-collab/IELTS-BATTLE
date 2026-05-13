'use client'

import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  timeLeft: number
  totalTime: number
  isRunning: boolean
  isExpired: boolean
}

export function CountdownTimer({ timeLeft, totalTime, isRunning, isExpired }: CountdownTimerProps) {
  const progress = timeLeft / totalTime
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference * (1 - progress)

  const color = isExpired
    ? 'stroke-red-500'
    : timeLeft < 120
    ? 'stroke-red-500'
    : timeLeft < 300
    ? 'stroke-amber-500'
    : 'stroke-blue-500'

  const textColor = isExpired
    ? 'text-red-600'
    : timeLeft < 120
    ? 'text-red-600'
    : timeLeft < 300
    ? 'text-amber-600'
    : 'text-slate-700'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-1000', color)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-xl font-bold tabular-nums', textColor)}>
            {formatTime(timeLeft)}
          </span>
          {isRunning && (
            <span className="text-xs text-slate-400">remaining</span>
          )}
          {isExpired && (
            <span className="text-xs text-red-500 font-medium">time up!</span>
          )}
        </div>
      </div>
    </div>
  )
}
