'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/tma/BackButton'
import { ChevronLeft, School, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function TeacherRegisterPage() {
  const router = useRouter()
  const { refreshUser } = useTMA()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/teacher/become', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? 'Invalid code')
        return
      }
      await refreshUser()
      toast.success('Teacher account activated!')
      router.replace('/teacher')
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-sm px-4 tma-safe-top pb-10">
        <div className="flex items-center gap-3 pt-1 mb-8">
          <Link href="/" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto">
            <School className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Become a Teacher</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
              Enter the teacher registration code provided by your administrator to unlock the teacher dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="TEACHER CODE"
              className="w-full rounded-xl border bg-secondary/50 pl-10 pr-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-primary"
              autoCapitalize="characters"
            />
          </div>
          <Button
            className="w-full h-11 rounded-xl gap-2"
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <School className="w-4 h-4" />}
            Activate Teacher Account
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Don&apos;t have a code? Ask your school administrator.
        </p>
      </div>
    </div>
  )
}
