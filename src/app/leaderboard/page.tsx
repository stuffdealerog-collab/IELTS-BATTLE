import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BackButton } from '@/components/tma/BackButton'
import { Trophy, Crown, ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const users = await prisma.telegramUser.findMany({
    where: { OR: [{ wins: { gt: 0 } }, { losses: { gt: 0 } }] },
    orderBy: { rating: 'desc' },
    take: 50,
  })

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-4">
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </h1>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No battles yet. Be the first!</p>
            <Link
              href="/battle"
              className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              Start a Battle
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const rank = i + 1
              const displayName = u.firstName ?? u.username ?? 'Player'
              const winRate =
                u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0
              const icon =
                rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`
              const topThree = rank <= 3

              return (
                <div
                  key={u.id}
                  className={`rounded-2xl elev-1 flex items-center gap-3 p-3 ${
                    topThree
                      ? 'bg-gradient-to-r from-amber-500/10 via-card to-card'
                      : 'bg-card'
                  }`}
                >
                  <div className="w-9 text-center font-bold text-sm shrink-0">{icon}</div>
                  {u.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.photoUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.wins}W {u.losses}L · {winRate}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold shrink-0">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    {u.rating}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
