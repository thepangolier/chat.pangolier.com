'use server'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Logs out the currently authenticated user by clearing their session.
 *
 * @returns A promise resolving to a GenericResponse indicating:
 *   - `ok: true` and a success message when logout completes,
 *   - `ok: false` and an error message if an exception occurs.
 */
export default async function logoutAction(): Promise<GenericResponse> {
  try {
    const session = await getSession()
    session.account = undefined
    await session.save()

    return { ok: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Error logging out user:', error)
    return { ok: false, message: 'Failed to log out user' }
  }
}
