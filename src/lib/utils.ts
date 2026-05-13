import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function bandToColor(band: number): string {
  if (band >= 8) return 'text-blue-600'
  if (band >= 7) return 'text-green-600'
  if (band >= 6) return 'text-yellow-600'
  if (band >= 5) return 'text-orange-500'
  return 'text-red-500'
}

export function bandToBg(band: number): string {
  if (band >= 8) return 'bg-blue-100 border-blue-300'
  if (band >= 7) return 'bg-green-100 border-green-300'
  if (band >= 6) return 'bg-yellow-100 border-yellow-300'
  if (band >= 5) return 'bg-orange-100 border-orange-300'
  return 'bg-red-100 border-red-300'
}
