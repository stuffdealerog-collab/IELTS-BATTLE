'use client'

import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Badge } from '@/components/ui/badge'
import {
  Swords,
  GraduationCap,
  PenLine,
  Trophy,
  Loader2,
  Crown,
  Zap,
  ChevronRight,
  School,
  Users,
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoading, isInTelegram } = useTMA()

  if (isLoading) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading IELTS Battle…</p>
      </div>
    )
  }

  if (!isInTelegram) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">📱</div>
        <h1 className="text-xl font-bold">Open in Telegram</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          IELTS Battle is a Telegram Mini App. Please open it via{' '}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">@ieltsbattle_bot</code>.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[var(--tg-stable-h,100vh)] flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing in…</p>
      </div>
    )
  }

  const displayName = user.firstName ?? user.username ?? 'Player'
  const totalGames = user.wins + user.losses
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        {/* User header */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {user.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full ring-2 ring-primary/20 shrink-0 object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[15px] leading-tight truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="font-semibold text-foreground">{user.rating}</span>
                <span className="opacity-40">·</span>
                <span>
                  {user.wins}W {user.losses}L
                </span>
                {totalGames > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{winRate}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/leaderboard"
            aria-label="Leaderboard"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Trophy className="w-[18px] h-[18px] text-amber-500" />
          </Link>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-5 text-white elev-2">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 -bottom-8 w-24 h-24 rounded-full bg-yellow-300/20 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-2.5 py-1 mb-3">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                IELTS Battle
              </span>
            </div>
            <h1 className="font-bold text-[22px] leading-tight tracking-tight">
              Master IELTS Writing
            </h1>
            <p className="text-sm text-white/85 mt-1 leading-snug">
              Battle players, learn with AI, climb the leaderboard.
            </p>
          </div>
        </div>

        {/* Modes */}
        <div className="space-y-2.5">
          <ModeCard
            href="/solo"
            icon={GraduationCap}
            title="Solo Mode"
            description="Step-by-step lessons with a real-time AI coach"
            tone="emerald"
            badge="AI Tutor"
          />
          <ModeCard
            href="/battle"
            icon={Swords}
            title="Battle Mode"
            description="1v1 ranked — Quick · Part · Full"
            tone="rose"
            badge="Live"
            badgeVariant="live"
          />
          <ModeCard
            href="/practice?taskType=ALL&category=ALL"
            icon={PenLine}
            title="Free Practice"
            description="Write at your own pace, get AI feedback on 4 IELTS criteria"
            tone="blue"
            badge="Solo"
            badgeVariant="outline"
          />
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <StatCard label="Rating" value={user.rating} />
          <StatCard label="Wins" value={user.wins} />
          <StatCard label="Losses" value={user.losses} />
        </div>

        {/* Teacher / Student tools */}
        {user.role === 'TEACHER' ? (
          <Link
            href="/teacher"
            className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-secondary transition-colors"
          >
            <School className="w-3.5 h-3.5" />
            Teacher Dashboard
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/join"
              className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-secondary transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Join a Class
            </Link>
            <Link
              href="/teacher/register"
              className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-secondary transition-colors"
            >
              <School className="w-3.5 h-3.5" />
              Become a Teacher
            </Link>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground pt-1">
          Master Writing Task 1 &amp; 2 with real exam topics
        </p>
      </div>
    </div>
  )
}

interface ModeCardProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  tone: 'emerald' | 'rose' | 'blue'
  badge?: string
  badgeVariant?: 'default' | 'outline' | 'live'
}

function ModeCard({
  href,
  icon: Icon,
  title,
  description,
  tone,
  badge,
  badgeVariant = 'default',
}: ModeCardProps) {
  const toneStyles = {
    emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-400',
    blue: 'from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400',
  }[tone]

  return (
    <Link href={href} className="block group">
      <div className="rounded-2xl bg-card p-3.5 flex items-center gap-3 elev-1 group-active:scale-[0.99] transition-transform">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${toneStyles} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-[22px] h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-[15px] leading-tight">{title}</h3>
            {badge &&
              (badgeVariant === 'live' ? (
                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-0 text-[10px] px-1.5 h-4 font-semibold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-rose-500 mr-1 animate-pulse" />
                  {badge}
                </Badge>
              ) : badgeVariant === 'outline' ? (
                <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                  {badge}
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] px-1.5 h-4 font-semibold">
                  {badge}
                </Badge>
              ))}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-card p-2.5 text-center elev-1">
      <p className="text-base font-bold leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
    </div>
  )
}
