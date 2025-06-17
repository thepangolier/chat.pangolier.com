import prisma from 'prisma/client'
import redis from '@util/redis'

/*
 * Persists the assistant reply once streaming has finished.
 *
 * @param textPromise - Promise resolving to the final assistant text.
 * @param threadId    - Numeric identifier of the thread being updated.
 */
export default async function persistAssistantMessage(
  textPromise: Promise<string>,
  threadId: number
): Promise<void> {
  const body = (await textPromise).trim()
  if (!body) return

  const streamKey = `thread:${threadId}:stream`

  const id = await redis.xadd(
    streamKey,
    '*',
    'senderId',
    '0',
    'role',
    'assistant',
    'body',
    body
  )
  if (!id) return

  const persisted = {
    id,
    threadId,
    senderId: 0,
    role: 'assistant',
    content: body,
    createdAt: Date.now()
  }

  await redis.call('JSON.SET', `msg:${id}`, '$', JSON.stringify(persisted))

  await prisma.thread.update({
    where: { id: threadId },
    data: { lastMessageId: id, lastMessageAt: new Date() }
  })
}
