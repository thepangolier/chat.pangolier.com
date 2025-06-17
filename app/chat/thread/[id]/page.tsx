import { notFound } from 'next/navigation'
import { getThreadMessagesAction } from '@action/chat/[id]'
import ChatInterface from '@component/chat/interface'

interface ThreadPageProps {
  params: { id: string }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const threadId = Number(params.id)
  if (Number.isNaN(threadId)) {
    return notFound()
  }

  const { result: messages } = await getThreadMessagesAction({ threadId })

  return <ChatInterface initialMessages={messages ?? []} />
}
