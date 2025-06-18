'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import redis from '@util/redis'

export interface BranchThreadParams {
  /** Original thread id to branch from */
  threadId: string
  /** Account initiating the branch */
  accountId: string
}

export interface BranchThreadResult extends GenericResponse {
  /** Newly created thread id */
  newThreadId?: string
}

/**
 * branchThreadAction – Duplicates all messages of `threadId` into a brand-new
 * thread and returns its id. The new thread's title will be prefixed with
 * "Branch of: " followed by the original title (or "Untitled" if missing).
 */
export async function branchThreadAction({
  threadId,
  accountId
}: BranchThreadParams): Promise<BranchThreadResult> {
  if (!threadId) return { ok: false, message: 'threadId is required' }

  // Fetch original thread meta.
  const original = await prisma.thread.findUnique({ where: { id: threadId } })
  if (!original)
    return { ok: false, message: 'Original thread could not be found' }

  // Create the new thread with prefixed title.
  const newThread = await prisma.thread.create({
    data: {
      title: `Branch of: ${original.title ?? 'Untitled'}`
    }
  })

  // Register the initiator as a participant of the new thread.
  await prisma.threadParticipant.create({
    data: { threadId: newThread.id, accountId }
  })
  await redis.sadd(`thread:${newThread.id}:participants`, accountId)

  // Copy messages from the original Redis stream to the new thread.
  const srcKey = `thread:${threadId}:stream`
  const destKey = `thread:${newThread.id}:stream`
  const entries: [string, string[]][] = await redis.xrange(srcKey, '-', '+')

  let lastId: string | null = null
  for (const [, fields] of entries) {
    // fields = [k1,v1,k2,v2,...]
    const obj: Record<string, string> = {}
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1]
    }

    // Persist in new stream preserving senderId/role/body
    lastId = await redis.xadd(
      destKey,
      '*',
      'senderId',
      obj['senderId'] ?? '',
      'role',
      obj['role'] ?? 'user',
      'body',
      obj['body'] ?? ''
    )
  }

  // Update last message metadata on new thread if we copied anything.
  if (lastId) {
    await prisma.thread.update({
      where: { id: newThread.id },
      data: { lastMessageId: lastId, lastMessageAt: new Date() }
    })
  }

  return { ok: true, message: 'Thread branched', newThreadId: newThread.id }
}
