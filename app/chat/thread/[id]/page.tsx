import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getThreadMessagesAction } from '@action/chat/[id]'
import ChatInterface from '@component/chat/interface'

export interface ThreadPageProps {
  params: Promise<{ id: string }>
}

const fetchThread = cache(async (threadId: number) => {
  return getThreadMessagesAction({ threadId })
})

export async function generateMetadata({
  params
}: ThreadPageProps): Promise<Metadata> {
  const { id } = await params
  const threadId = Number(id)
  if (Number.isNaN(threadId)) {
    return { title: 'Thread' }
  }
  const { thread } = await fetchThread(threadId)
  return { title: thread?.title ?? 'Thread' }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params
  const threadId = Number(id)
  if (Number.isNaN(threadId)) {
    return notFound()
  }

  const { result: messages } = await fetchThread(threadId)

  return <ChatInterface initialMessages={messages ?? []} />
}
