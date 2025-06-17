'use server'
import type { CoreMessage } from 'ai'
import { type PersistedMessage } from '@action/chat/send'
import type { GenericResponse } from '@action/types'
import redis from '@util/redis'

export interface GetMessagesParams {
  /** Thread id to fetch */
  threadId: number
  /** How many messages to return (latest first). 0 or undefined = all. */
  limit?: number
}

export interface GetMessagesResult extends GenericResponse {
  result?: PersistedMessage[]
}

/**
 * getThreadMessagesAction – Retrieve all (or latest `limit`) messages for a thread.
 */
export async function getThreadMessagesAction({
  threadId,
  limit
}: GetMessagesParams): Promise<GetMessagesResult> {
  if (!threadId) return { ok: false, message: 'threadId is required' }

  try {
    const streamKey = `thread:${threadId}:stream`
    // XRANGE to get messages from beginning to end. Apply COUNT if limit supplied.
    const entries: [string, string[]][] = limit
      ? await redis.xrevrange(streamKey, '+', '-', 'COUNT', limit).then(
          (arr) => arr.reverse() // restore chronological order
        )
      : await redis.xrange(streamKey, '-', '+')

    const messages: PersistedMessage[] = []

    for (const [id, fields] of entries) {
      const obj: Record<string, string> = {}
      for (let i = 0; i < fields.length; i += 2) {
        obj[fields[i]] = fields[i + 1]
      }

      // Attempt to parse content
      let content: CoreMessage['content'] = obj['body']
      if (content?.startsWith('{') || content?.startsWith('[')) {
        try {
          content = JSON.parse(content)
        } catch {
          /* leave as string */
        }
      }

      messages.push({
        id,
        threadId,
        senderId: Number(obj['senderId']),
        role: obj['role'] as CoreMessage['role'],
        content,
        createdAt: Number(id.split('-')[0]),
        attachments: undefined
      } as PersistedMessage)
    }

    return { ok: true, message: 'Messages fetched', result: messages }
  } catch (error) {
    console.error('getThreadMessagesAction error:', error)
    return { ok: false, message: 'Failed to fetch messages' }
  }
}
