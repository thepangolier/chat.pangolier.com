import type { Metadata } from 'next'
import { cache } from 'react'
import { getThreadMessagesAction } from '@action/chat/[id]'
import ChatInterface from '@component/chat/interface'

export interface ThreadPageProps {
  params: Promise<{ id: string }>
}

const fetchThread = cache(async (threadId: string) => {
  return getThreadMessagesAction({ threadId })
})

export async function generateMetadata({
  params
}: ThreadPageProps): Promise<Metadata> {
  const { id } = await params
  const { thread } = await fetchThread(id)
  return { title: thread?.title ?? 'Thread' }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params
  const { result: messages } = await fetchThread(id)

  return <ChatInterface initialMessages={messages ?? []} />
}
