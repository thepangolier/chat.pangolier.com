'use client'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { type PersistedMessage, sendMessageAction } from '@action/chat/send'
import { useChat } from '@ai-sdk/react'
import Message from '@component/chat/message'
import PromptBar from '@component/chat/prompt'
import ChatSplash from '@component/chat/splash'
import { useSession } from '@context/session'
import MapMessages from '@util/map'

export interface ChatInterfaceProps {
  initialMessages?: PersistedMessage[]
}

export default function ChatInterface({
  initialMessages = []
}: ChatInterfaceProps) {
  const { account, model, reasoning, useSearchGrounding } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()
  const isThreadRoute = Boolean(params?.id)
  const [threadId, setThreadId] = useState<string | undefined>(
    isThreadRoute ? params!.id : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isThreadRoute) setThreadId(params!.id)
  }, [isThreadRoute, params])

  useEffect(() => {
    if (!isThreadRoute) setThreadId(undefined)
  }, [isThreadRoute])

  const mappedInitial = MapMessages(initialMessages)

  const {
    messages,
    status,
    error,
    input,
    setInput,
    handleSubmit,
    stop,
    experimental_resume
  } = useChat({
    api: '/api/chat',
    experimental_throttle: 50,
    initialMessages: mappedInitial,
    body: {
      threadId,
      provider: model.provider,
      model: model.model,
      reasoning,
      useSearchGrounding
    }
  })

  const getStatus = useMemo(() => {
    if (pathname === '/chat' && messages.length >= 2) return 'submitted'

    return isSubmitting ? 'submitted' : status
  }, [pathname, messages.length, isSubmitting, status])

  const onSubmit = useCallback(async () => {
    if (!input.trim()) return
    setIsSubmitting(true)

    const payload = await sendMessageAction({
      threadId: threadId ?? '',
      senderId: account.id,
      message: { role: 'user', content: input }
    })
    if (!payload.ok) return

    if (!threadId) setThreadId(payload.result!.threadId)

    handleSubmit(undefined, {
      body: { threadId: threadId ?? payload.result!.threadId }
    })
    setIsSubmitting(false)
  }, [threadId, account.id, input, handleSubmit])

  useEffect(() => {
    if (
      !isThreadRoute &&
      threadId &&
      status === 'ready' &&
      messages.some((m) => m.role === 'assistant')
    ) {
      startTransition(() => router.push(`/chat/thread/${threadId}`))
    }
  }, [isThreadRoute, threadId, status, messages, router])

  return (
    <div id="chat">
      <div className="container chat">
        <div className="message-container">
          {messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              threadId={threadId}
              status={getStatus}
            />
          ))}
          {messages.length === 0 && <ChatSplash setInput={setInput} />}
        </div>
        <PromptBar
          status={getStatus}
          error={error}
          input={input}
          setInput={setInput}
          handleSubmit={onSubmit}
          stop={stop}
          experimental_resume={experimental_resume}
        />
      </div>
    </div>
  )
}
