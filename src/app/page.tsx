'use client'

import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Swords, GraduationCap, PenLine, Trophy, Loader2, Crown, Zap } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading, isInTelegram } = useTMA()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading IELTS Battle…</p>
      </div>
    )
  }

  if (!isInTelegram) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">📱</div>
        <h1 className="text-xl font-bold">Open in Telegram</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          IELTS Battle is a Telegram Mini App. Please open it inside Telegram to play.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm text-muted-foreground">Signing in…</p>
      </div>
    )
  }

  const displayName = user.firstName ?? user.username ?? 'Player'
  const winRate = user.wins + user.losses > 0
    ? Math.round((user.wins / (user.wins + user.losses)) * 100)
    : 0

  return (
    <div className="min-h-screen p-4 pb-8 space-y-4">
      {/* User header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-base leading-tight">{displayName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="font-semibold">{user.rating}</span>
              <span>·</span>
              <span>{user.wins}W {user.losses}L</span>
              {winRate > 0 && <span>· {winRate}%</span>}
            </div>
          </div>
        </div>
        <Link href="/leaderboard">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-5 text-white">
        <Zap className="w-6 h-6 mb-2 text-yellow-300" />
        <h1 className="font-bold text-xl leading-tight">Master IELTS Writing</h1>
        <p className="text-sm text-white/80 mt-1">
          Battle friends, learn with AI, climb the leaderboard.
        </p>
      </div>

      {/* Modes */}
      <div className="space-y-3">
        {/* Solo Mode */}
        <Link href="/solo">
          <Card className="hover:scale-[0.99] active:scale-[0.98] transition-transform cursor-pointer border-0 bg-card shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold">Solo Mode</h3>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 h-4 border-0">
                    AI Tutor
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Learn step-by-step with a real-time AI writing coach
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Battle Mode */}
        <Link href="/battle">
          <Card className="hover:scale-[0.99] active:scale-[0.98] transition-transform cursor-pointer border-0 bg-card shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Swords className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold">Battle Mode</h3>
                  <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 h-4 border-0">
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compete 1v1 — Quick / Part / Full IELTS battles
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Practice Mode */}
        <Link href="/practice?taskType=ALL&category=ALL">
          <Card className="hover:scale-[0.99] active:scale-[0.98] transition-transform cursor-pointer border-0 bg-card shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <PenLine className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold">Free Practice</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                    Solo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Write at your own pace, get AI feedback on all 4 IELTS criteria
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Master Writing Task 1 &amp; 2 with real exam topics
      </p>
    </div>
  )
}
