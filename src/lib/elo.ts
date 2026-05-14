const K = 32

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function ratingDelta(playerRating: number, opponentRating: number, result: 'win' | 'loss' | 'draw'): number {
  const expected = expectedScore(playerRating, opponentRating)
  const actual = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5
  return Math.round(K * (actual - expected))
}

export function computeFinalScore(bandScore: number, speedBonus: number): number {
  return Math.round((bandScore * 10 + speedBonus) * 10) / 10
}

export function computeSpeedBonus(timeTakenSec: number, timeLimitSec: number): number {
  if (timeTakenSec >= timeLimitSec) return 0
  const ratio = 1 - timeTakenSec / timeLimitSec
  return Math.round(ratio * 5 * 10) / 10
}
