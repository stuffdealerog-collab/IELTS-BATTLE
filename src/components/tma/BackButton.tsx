'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  isTMA,
  mountBackButton,
  unmountBackButton,
  showBackButton,
  hideBackButton,
  onBackButtonClick,
  offBackButtonClick,
} from '@telegram-apps/sdk-react'

interface BackButtonProps {
  onClick?: () => void
  fallbackPath?: string
}

export function BackButton({ onClick, fallbackPath = '/' }: BackButtonProps) {
  const router = useRouter()

  useEffect(() => {
    let mounted = false
    let detach: (() => void) | undefined

    const handler = () => {
      if (onClick) onClick()
      else router.push(fallbackPath)
    }

    const setup = async () => {
      const inTMA = await isTMA()
      if (!inTMA) return

      try {
        if (mountBackButton.isAvailable()) {
          mountBackButton()
          mounted = true
        }
        showBackButton()
        onBackButtonClick(handler)
        detach = () => offBackButtonClick(handler)
      } catch {}
    }

    setup()

    return () => {
      detach?.()
      if (mounted) {
        try {
          hideBackButton()
          unmountBackButton()
        } catch {}
      }
    }
  }, [onClick, fallbackPath, router])

  return null
}
