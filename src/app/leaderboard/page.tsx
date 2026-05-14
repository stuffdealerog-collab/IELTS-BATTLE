import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Crown, Medal, ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const users = await prisma.telegramUser.findMany({
    where: { OR: [{ wins: { gt: 0 } }, { losses: { gt: 0 } }] },
    orderBy: { rating: 'desc' },
    take: 50,
  })

  return (
    <div className="min-h-screen p-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Leaderboard
        </h1>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm">No battles yet. Be the first!</p>
          <Link
            href="/battle"
            className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
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

            return (
              <Card key={u.id} className="border-0 shadow-sm">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-10 text-center font-bold text-sm">
                    {icon}
                  </div>
                  {u.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.photoUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.wins}W {u.losses}L · {winRate}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    {u.rating}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
