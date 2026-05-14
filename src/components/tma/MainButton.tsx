'use client'

import { useEffect } from 'react'
import {
  isTMA,
  mountMainButton,
  unmountMainButton,
  setMainButtonParams,
  onMainButtonClick,
  offMainButtonClick,
} from '@telegram-apps/sdk-react'

interface MainButtonProps {
  text: string
  onClick: () => void
  visible?: boolean
  enabled?: boolean
  loading?: boolean
  color?: string
  textColor?: string
}

export function MainButton({
  text,
  onClick,
  visible = true,
  enabled = true,
  loading = false,
  color,
  textColor,
}: MainButtonProps) {
  useEffect(() => {
    let mounted = false
    let detach: (() => void) | undefined

    const setup = async () => {
      const inTMA = await isTMA()
      if (!inTMA) return

      try {
        if (mountMainButton.isAvailable()) {
          mountMainButton()
          mounted = true
        }
        setMainButtonParams({
          text,
          isVisible: visible,
          isEnabled: enabled,
          isLoaderVisible: loading,
          ...(color ? { backgroundColor: color as `#${string}` } : {}),
          ...(textColor ? { textColor: textColor as `#${string}` } : {}),
        })
        onMainButtonClick(onClick)
        detach = () => offMainButtonClick(onClick)
      } catch {
        // ignore — feature not supported
      }
    }

    setup()

    return () => {
      detach?.()
      if (mounted) {
        try {
          setMainButtonParams({ isVisible: false })
          unmountMainButton()
        } catch {}
      }
    }
  }, [text, visible, enabled, loading, color, textColor, onClick])

  return null
}
