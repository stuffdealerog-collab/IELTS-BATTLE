'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/tma/BackButton'
import { ChevronLeft, Users, Loader2, Hash } from 'lucide-react'
import { toast } from 'sonner'

export default function JoinClassPage() {
  const router = useRouter()
  const { user } = useTMA()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/student/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Invalid code')
        return
      }
      toast.success(`Joined ${data.classroom.name}!`)
      router.replace('/')
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
            <Users className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Join a Class</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
              Enter the 6-character code your teacher shared with you.
            </p>
          </div>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="CLASS CODE"
                maxLength={6}
                className="w-full rounded-xl border bg-secondary/50 pl-10 pr-4 py-3 text-sm font-mono tracking-[0.3em] uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                autoCapitalize="characters"
              />
            </div>
            <Button
              className="w-full h-11 rounded-xl gap-2"
              onClick={handleJoin}
              disabled={loading || code.trim().length < 4}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Join Class
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ask your teacher for the join code.
        </p>
      </div>
    </div>
  )
}
