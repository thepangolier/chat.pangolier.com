'use server'
import type { Account, Prisma } from 'prisma/client'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Parameters for listing accounts with optional pagination and search filters.
 *
 * @property skip   - Number of records to skip for pagination; defaults to 0.
 * @property take   - Maximum number of records to return; defaults to 10.
 * @property search - Optional text to filter accounts by name or email.
 */
export interface ListAccountsRequest {
  skip?: number
  take?: number
  search?: string
}

/**
 * Response for listing accounts, extending the generic API response.
 * Includes an array of Account records when the operation succeeds.
 */
export interface ListAccountsResponse extends GenericResponse {
  /** An array of accounts matching the request criteria. */
  result?: Account[]
}

/**
 * Retrieves a list of accounts for an authenticated administrator.
 * Supports pagination via skip and take, and filters by partial matches
 * on account name or email if a search term is provided.
 *
 * @param data - Object containing pagination and search options.
 * @returns A promise resolving to a ListAccountsResponse indicating
 *          whether the fetch succeeded and, if so, the accounts array.
 */
export async function listAccountsAction(
  data: ListAccountsRequest
): Promise<ListAccountsResponse> {
  try {
    const session = await getSession()

    if (!session?.admin) {
      return { ok: false, message: 'Not authorized' }
    }

    const { skip = 0, take = 10, search } = data

    const where: Prisma.AccountWhereInput = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const accounts = await prisma.account.findMany({
      skip,
      take,
      where
    })

    return {
      ok: true,
      message: 'Accounts fetched successfully',
      result: accounts
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { ok: false, message: 'Failed to fetch accounts', result: [] }
  }
}
