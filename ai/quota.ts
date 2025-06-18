import prisma from 'prisma/client'
import persistAssistantMessage from '@ai/persist'

/*
 * Enforces a 5-message free quota and, when exhausted, streams a CTA that
 * conforms to the AI SDK Data-Stream protocol.
 *
 * @param accountId - Current user’s UUID (from session / auth header).
 * @param threadId  - Optional thread for persisting the CTA reply.
 * @returns         - A Response ending the request, or void when quota remains.
 */
export async function guardFreeQuota(
  accountId: string,
  threadId?: string
): Promise<Response | void> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { freeMessagesRemaining: true }
  })
  if (!account) return new Response('Unauthorized', { status: 401 })

  if (account.freeMessagesRemaining <= 0) {
    const cta =
      'You’ve reached the free limit of 5 messages. Fork the full project on GitHub to keep chatting: https://github.com/thepangolier/chat.pangolier.com'

    if (threadId) await persistAssistantMessage(threadId, cta)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        /* Text part (type-id 0) */
        controller.enqueue(encoder.encode(`0:${JSON.stringify(cta)}\n`))
        /* Finish-message part (type-id d) */
        controller.enqueue(
          encoder.encode(`d:${JSON.stringify({ finishReason: 'stop' })}\n`)
        )
        controller.close()
      }
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1', // required header [oai_citation:2‡ai-sdk.dev](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol?utm_source=chatgpt.com)
        'cache-control': 'no-cache'
      }
    })
  }

  /* quota still available → decrement and continue */
  await prisma.account.update({
    where: { id: accountId },
    data: { freeMessagesRemaining: { decrement: 1 } }
  })
}
