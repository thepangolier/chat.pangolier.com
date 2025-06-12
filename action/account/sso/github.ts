'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Disconnects the GitHub OAuth integration for the authenticated account by clearing stored GitHub credentials.
 *
 * @returns A promise that resolves to a {@link GenericResponse} indicating whether the disconnection succeeded.
 */
export async function GitHubDisconnectAction(): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: { githubId: null, githubUrl: null }
    })

    session.account = account
    await session.save()

    return { ok: true, message: 'GitHub disconnected successfully' }
  } catch (error) {
    console.error('Error disconnecting GitHub:', error)
    return { ok: false, message: 'Error disconnecting GitHub' }
  }
}
