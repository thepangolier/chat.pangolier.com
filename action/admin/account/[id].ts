'use server'
import type { Account } from 'prisma/client'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Parameters for retrieving an account by identifier.
 * Can be a numeric or string representation of the account ID.
 */
export interface GetAccountRequest {
  /** The unique identifier of the account to fetch. */
  id: string | number
}

/**
 * Response returned when fetching an account.
 * Extends the standard {@link GenericResponse} with an optional account result.
 */
export interface GetAccountResponse extends GenericResponse {
  /** The fetched account data when `ok` is true. */
  result?: Account
}

/**
 * Retrieves an account by ID, accessible only to authenticated administrators.
 * Validates admin privileges and returns the account data if found.
 *
 * @param data - An object containing the account identifier to fetch.
 * @param data.id - The ID of the account to retrieve.
 * @returns A promise that resolves to a {@link GetAccountResponse}:
 *   - `ok`: true if the account was successfully fetched;
 *   - `message`: descriptive status or error message;
 *   - `result`: the {@link Account} record when `ok` is true.
 */
export async function getAccountAction(
  data: GetAccountRequest
): Promise<GetAccountResponse> {
  try {
    const session = await getSession()

    if (!session?.admin) {
      return { ok: false, message: 'Not authorized' }
    }

    const { id } = data
    const account = await prisma.account.findUnique({
      where: { id: Number(id) }
    })

    if (!account) {
      return { ok: false, message: 'Account not found' }
    }

    return {
      ok: true,
      message: 'Account fetched successfully',
      result: account
    }
  } catch (error) {
    console.error('Error fetching account:', error)
    return { ok: false, message: 'Failed to fetch account' }
  }
}
