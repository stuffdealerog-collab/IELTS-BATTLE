import { cn, bandToColor, bandToBg } from '@/lib/utils'
import { BAND_DESCRIPTORS } from '@/lib/constants'

interface BandScoreGaugeProps {
  band: number
  label?: string
  size?: 'sm' | 'lg'
}

export function BandScoreGauge({ band, label, size = 'sm' }: BandScoreGaugeProps) {
  const descriptor = BAND_DESCRIPTORS[Math.floor(band)] ?? 'Limited User'

  if (size === 'lg') {
    return (
      <div className={cn('flex flex-col items-center p-6 rounded-2xl border-2', bandToBg(band))}>
        <span className="text-5xl font-bold tabular-nums">{band.toFixed(1)}</span>
        <span className={cn('text-lg font-semibold mt-1', bandToColor(band))}>{descriptor}</span>
        {label && <span className="text-sm text-slate-500 mt-1">{label}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border', bandToBg(band))}>
      <span className={cn('text-2xl font-bold tabular-nums', bandToColor(band))}>
        {band.toFixed(1)}
      </span>
      {label && <span className="text-sm text-slate-600 font-medium">{label}</span>}
    </div>
  )
}
