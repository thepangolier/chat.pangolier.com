'use server'
import type { Account } from 'prisma/build'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Response shape for fetching the current session’s account.
 *
 * Extends {@link GenericResponse} by including a `result` property
 * that contains the authenticated account or `null`.
 */
export interface SessionResponse extends GenericResponse {
  /** The authenticated account data, or `null` if not logged in or on error. */
  result: Account | null
}

/**
 * Retrieves the currently authenticated account from the session.
 *
 * Masks sensitive fields (`password`, `emailCode`, `targetEmail`) before returning.
 *
 * @returns A promise that resolves to a {@link SessionResponse}:
 *   - `ok: true` and `result` populated when an account is found,
 *   - `ok: false` and `result: null` when no account is in session or on error.
 */
export default async function getAccount(): Promise<SessionResponse> {
  try {
    const session = await getSession()

    if (!session.account) {
      return {
        ok: false,
        message: 'No account found in session',
        result: null
      }
    }

    const account = session.account

    return {
      ok: true,
      message: 'Account found in session',
      result: {
        ...account,
        password: account.password ? 'set' : null,
        emailCode: null,
        targetEmail: null,
        targetCode: null
      }
    }
  } catch (error) {
    console.error('Error retrieving account from session:', error)
    return {
      ok: false,
      message: 'Failed to retrieve account from session',
      result: null
    }
  }
}
