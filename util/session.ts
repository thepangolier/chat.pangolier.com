import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { Account } from 'prisma/client'

export const password =
  process.env.SESSION_SECRET ||
  '06d89f8a2dce1613ef516f41540b1622a24e9e6f99db23b16775a359cb71f32a'

export interface SessionInterface {
  verifyId?: string | number // For 2FA verification
  account?: Account
}

export default async function getSession() {
  return getIronSession<SessionInterface>(await cookies(), {
    password,
    cookieName: 'pangolier-chat',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: process.env.COOKIE_AGE
        ? Number(process.env.COOKIE_AGE)
        : undefined
    }
  })
}
