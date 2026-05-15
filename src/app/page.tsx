'use client'

import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Flame,
  Star,
  CalendarCheck,
  Bot,
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
  const xpPct = Math.round((user.xpProgress / user.xpNeeded) * 100)

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-4">

        {/* Header: avatar + name + streak + leaderboard */}
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
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[15px] leading-tight truncate">{displayName}</p>
                <Badge className="bg-primary/10 text-primary border-0 text-[9px] h-4 px-1.5 shrink-0">
                  Lv.{user.level}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 max-w-[90px]">
                  <Progress value={xpPct} className="h-1" />
                </div>
                <span className="text-[10px] text-muted-foreground">{user.xpProgress}/{user.xpNeeded} XP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user.streak > 0 && (
              <div className="flex items-center gap-0.5 bg-orange-500/15 rounded-full px-2 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {user.streak}
                </span>
              </div>
            )}
            <Link
              href="/leaderboard"
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 text-white elev-2">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 -bottom-8 w-24 h-24 rounded-full bg-yellow-300/20 blur-2xl" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-2.5 py-1 mb-2">
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">IELTS Battle</span>
              </div>
              <h1 className="font-bold text-[20px] leading-tight">Master IELTS Writing</h1>
              <p className="text-xs text-white/80 mt-0.5">Battle · Learn · Improve</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-lg font-bold">{user.rating}</span>
              </div>
              <p className="text-[10px] text-white/70">Rating</p>
              {user.currentBand && (
                <>
                  <p className="text-base font-bold mt-0.5">{user.currentBand.toFixed(1)}</p>
                  <p className="text-[10px] text-white/70">Est. Band</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <Link href="/daily" className="block group">
          <div className={`rounded-2xl p-3.5 flex items-center gap-3 elev-1 transition-transform group-active:scale-[0.99] ${
            user.dailyDone
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900'
              : 'bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-200 dark:border-amber-900'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              user.dailyDone ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            }`}>
              <CalendarCheck className={`w-5 h-5 ${user.dailyDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm">Daily Challenge</p>
                {!user.dailyDone && (
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0 text-[10px] h-4 px-1.5 gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    +50 XP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.dailyDone ? '✓ Completed today — come back tomorrow!' : 'New challenge ready · Keep your streak!'}
              </p>
            </div>
            {!user.dailyDone && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        </Link>

        {/* Modes */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Game Modes</p>
          <ModeCard
            href="/solo"
            icon={GraduationCap}
            title="Solo Mode"
            description="Step-by-step lessons with vocab, grammar tips & model answers"
            tone="emerald"
            badge="AI Tutor"
          />
          <ModeCard
            href="/battle"
            icon={Swords}
            title="Battle Mode"
            description="1v1 ranked writing — real players or AI bots at your level"
            tone="rose"
            badge="Live"
            badgeVariant="live"
          />
          <ModeCard
            href="/practice?taskType=ALL&category=ALL"
            icon={PenLine}
            title="Free Practice"
            description="Write at your own pace · full AI IELTS grading on 4 criteria"
            tone="blue"
            badge="Solo"
            badgeVariant="outline"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Rating" value={user.rating} />
          <StatCard label="Wins" value={user.wins} />
          <StatCard label="Streak" value={`${user.streak}🔥`} />
          <StatCard label="Level" value={`${user.level}⭐`} />
        </div>

        {/* Teacher / Class row */}
        {user.role === 'TEACHER' ? (
          <Link
            href="/teacher"
            className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-secondary transition-colors"
          >
            <School className="w-3.5 h-3.5" />
            Teacher Dashboard
          </Link>
        ) : user.classroom ? (
          <Link href="/my-class" className="block rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-500/10 p-3 hover:bg-indigo-500/15 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">My Class</p>
                <p className="text-sm font-semibold truncate">{user.classroom.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link href="/join" className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-secondary transition-colors">
              <Users className="w-3.5 h-3.5" />
              Join a Class
            </Link>
            <Link href="/teacher/register" className="flex items-center justify-center gap-1.5 h-9 rounded-xl border bg-secondary/50 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-secondary transition-colors">
              <School className="w-3.5 h-3.5" />
              Become a Teacher
            </Link>
          </div>
        )}
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

function ModeCard({ href, icon: Icon, title, description, tone, badge, badgeVariant = 'default' }: ModeCardProps) {
  const toneStyles = {
    emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-400',
    blue: 'from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400',
  }[tone]

  return (
    <Link href={href} className="block group">
      <div className="rounded-2xl bg-card p-3.5 flex items-center gap-3 elev-1 group-active:scale-[0.99] transition-transform">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${toneStyles} flex items-center justify-center shrink-0`}>
          <Icon className="w-[22px] h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-[15px] leading-tight">{title}</h3>
            {badge && (
              badgeVariant === 'live' ? (
                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-0 text-[10px] px-1.5 h-4 font-semibold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-rose-500 mr-1 animate-pulse" />
                  {badge}
                </Badge>
              ) : badgeVariant === 'outline' ? (
                <Badge variant="outline" className="text-[10px] px-1.5 h-4">{badge}</Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] px-1.5 h-4 font-semibold">{badge}</Badge>
              )
            )}
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
      <p className="text-sm font-bold leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
    </div>
  )
}
