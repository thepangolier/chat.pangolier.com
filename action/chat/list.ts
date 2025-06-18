'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'

export interface ListThreadsParams {
  /** Account whose threads we want to retrieve */
  accountId: string
  /** Optional case-insensitive query to filter by thread title */
  query?: string
}

export interface ThreadSummary {
  id: string
  title: string
  /** The time of the last message in milliseconds since epoch */
  lastMessageAt: number | null
}

export interface ListThreadsResult extends GenericResponse {
  result?: ThreadSummary[]
}

/**
 * listThreadsAction – Returns all threads that the given account participates in.
 * If a `query` is supplied, it performs a case-insensitive search over the title.
 */
export async function listThreadsAction({
  accountId,
  query
}: ListThreadsParams): Promise<ListThreadsResult> {
  if (!accountId) {
    return { ok: false, message: 'accountId is required' }
  }

  try {
    const threads = await prisma.thread.findMany({
      where: {
        participants: {
          some: { accountId }
        },
        ...(query
          ? {
              title: {
                contains: query,
                mode: 'insensitive'
              }
            }
          : {})
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        lastMessageAt: true
      }
    })

    const summaries: ThreadSummary[] = threads.map((thread) => ({
      id: thread.id,
      title: thread.title ?? 'Untitled',
      lastMessageAt: thread.lastMessageAt
        ? thread.lastMessageAt.getTime()
        : null
    }))

    return {
      ok: true,
      message: 'Threads fetched',
      result: summaries
    }
  } catch (error) {
    console.error('listThreadsAction error:', error)
    return { ok: false, message: 'Failed to fetch threads' }
  }
}
