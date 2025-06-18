'use server'
import type { CoreMessage } from 'ai'
import prisma from 'prisma/client'
import { generateTitleAction } from '@action/chat/title'
import type { GenericResponse } from '@action/types'
import redis from '@util/redis'

export type PersistedMessage = CoreMessage & {
  id: string
  threadId: string
  senderId: string
  createdAt: number
  attachments?: string[]
  parts?: { type: 'text' | 'reasoning'; text?: string; reasoning?: string }[]
}

export type MessagePayload = CoreMessage & { attachments?: string[] }

export interface SendMessageParams {
  /**
   * Existing thread to post a message to.
   * Omit or pass `0` to create a brand-new thread and persist the first message.
   */
  threadId?: string
  senderId: string
  message: MessagePayload
}

export interface SendMessageResult extends GenericResponse {
  result?: PersistedMessage
}

export async function sendMessageAction({
  threadId,
  senderId,
  message
}: SendMessageParams): Promise<SendMessageResult> {
  const body =
    typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content)
  if (!body.trim()) return { ok: false, message: 'Message body is required' }

  // Determine the thread we are working with. If `threadId` is not supplied or is `0`,
  // create a brand-new thread and register the sender as the first participant.
  let effectiveThreadId = threadId ?? ''
  if (!effectiveThreadId) {
    const newThread = await prisma.thread.create({
      data: {
        title:
          (await generateTitleAction({ message: body })).result ?? 'New Thread'
      }
    })
    effectiveThreadId = newThread.id

    // Persist the sender as a participant of the new thread.
    await prisma.threadParticipant.create({
      data: { threadId: effectiveThreadId, accountId: senderId }
    })
    // Cache membership in Redis for quick look-ups.
    await redis.sadd(
      `thread:${effectiveThreadId}:participants`,
      String(senderId)
    )
  }

  const participantsKey = `thread:${effectiveThreadId}:participants`
  const isMember = await redis.sismember(participantsKey, String(senderId))
  if (!isMember) {
    const exists = await prisma.threadParticipant.findUnique({
      where: {
        threadId_accountId: { threadId: effectiveThreadId, accountId: senderId }
      }
    })
    if (!exists) return { ok: false, message: 'Sender is not a participant' }
    void redis.sadd(participantsKey, String(senderId))
  }

  const streamKey = `thread:${effectiveThreadId}:stream`
  const id = await redis.xadd(
    streamKey,
    '*',
    'senderId',
    String(senderId),
    'role',
    message.role,
    'body',
    body
  )

  if (!id) return { ok: false, message: 'Failed to persist message' }

  const persisted: PersistedMessage = {
    ...message,
    id,
    threadId: effectiveThreadId,
    senderId,
    createdAt: Date.now(),
    attachments: (message as MessagePayload).attachments
  }
  await redis.call('JSON.SET', `msg:${id}`, '$', JSON.stringify(persisted))

  await prisma.thread.update({
    where: { id: effectiveThreadId },
    data: { lastMessageId: id, lastMessageAt: new Date() }
  })

  return { ok: true, message: 'Message sent', result: persisted }
}
