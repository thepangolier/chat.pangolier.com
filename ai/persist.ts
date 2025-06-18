import prisma from 'prisma/client'
import type { PersistedMessage } from '@action/chat/send'
import redis from '@util/redis'

interface TextPart {
  type: 'text'
  text: string
}
interface ReasoningPart {
  type: 'reasoning'
  reasoning: string
}

/**
 * Persists the assistant reply once streaming has finished.
 */
export default async function persistAssistantMessage(
  threadId: string,
  text: string,
  reasoningText?: string | undefined
): Promise<void> {
  const body = text.trim()
  const reasoning = reasoningText?.trim()

  if (!body) return // nothing useful to store

  const parts: (TextPart | ReasoningPart)[] | undefined = reasoning
    ? [
        { type: 'reasoning', reasoning },
        { type: 'text', text: body }
      ]
    : undefined

  const fieldValues: (string | number)[] = [
    'senderId',
    '0',
    'role',
    'assistant',
    'body',
    body
  ]
  if (parts) fieldValues.push('parts', JSON.stringify(parts))

  const streamKey = `thread:${threadId}:stream`
  const id = await redis.xadd(streamKey, '*', ...fieldValues)
  if (!id) return

  const persisted: PersistedMessage = {
    id,
    threadId,
    senderId: '',
    role: 'assistant',
    content: body,
    parts,
    createdAt: Date.now()
  }

  await redis.call('JSON.SET', `msg:${id}`, '$', JSON.stringify(persisted))

  await prisma.thread.update({
    where: { id: threadId },
    data: { lastMessageId: id, lastMessageAt: new Date() }
  })
}
