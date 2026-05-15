import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const RAW_SECRET = process.env.JWT_SECRET
if (!RAW_SECRET || RAW_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a 32+ character string in production')
  }
  console.warn('⚠ JWT_SECRET missing or too short — using dev fallback. DO NOT deploy this.')
}
const SECRET = new TextEncoder().encode(
  RAW_SECRET && RAW_SECRET.length >= 32
    ? RAW_SECRET
    : 'dev-secret-replace-in-production-this-must-be-32-bytes-or-more'
)
const COOKIE = 'ielts_battle_session'
const ALG = 'HS256'

export interface SessionPayload {
  userId: string
  telegramId: string
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return { userId: payload.userId as string, telegramId: payload.telegramId as string }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE)
}
