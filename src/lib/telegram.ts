import { validate, parse } from '@telegram-apps/init-data-node'

export interface ParsedTelegramUser {
  id: number
  username?: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  languageCode?: string
  isPremium?: boolean
}

export function validateInitData(initDataRaw: string): ParsedTelegramUser | null {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TELEGRAM_BOT_TOKEN not configured')
    }
    return null
  }

  try {
    validate(initDataRaw, token, { expiresIn: 3600 })
    const parsed = parse(initDataRaw)
    const u = parsed.user
    if (!u) return null

    return {
      id: Number(u.id),
      username: u.username,
      firstName: u.first_name,
      lastName: u.last_name,
      photoUrl: u.photo_url,
      languageCode: u.language_code,
      isPremium: u.is_premium,
    }
  } catch {
    return null
  }
}
