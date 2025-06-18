import { notFound } from 'next/navigation'
import { getThreadMessagesAction } from '@action/chat/[id]'
import ChatInterface from '@component/chat/interface'

export interface ThreadPageProps {
  params: Promise<{ id: string }>
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params
  const threadId = Number(id)
  if (Number.isNaN(threadId)) {
    return notFound()
  }

  const { result: messages } = await getThreadMessagesAction({ threadId })

  return <ChatInterface initialMessages={messages ?? []} />
}
