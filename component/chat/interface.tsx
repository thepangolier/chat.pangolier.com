'use client'
import { useParams, useRouter } from 'next/navigation'
import {
  type FormEvent,
  startTransition,
  useCallback,
  useEffect,
  useState
} from 'react'
import { type PersistedMessage, sendMessageAction } from '@action/chat/send'
import { useChat } from '@ai-sdk/react'
import Message from '@component/chat/message'
import PromptBar from '@component/chat/prompt'
import { useSession } from '@context/session'

export interface ChatInterfaceProps {
  initialMessages?: PersistedMessage[]
}

export default function ChatInterface({
  initialMessages = []
}: ChatInterfaceProps) {
  const { account, model, reasoning, useSearchGrounding } = useSession()
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const isThreadRoute = Boolean(params?.id)
  const [threadId, setThreadId] = useState<number | undefined>(
    isThreadRoute ? Number(params!.id) : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isThreadRoute) setThreadId(Number(params!.id))
  }, [isThreadRoute, params])

  useEffect(() => {
    if (!isThreadRoute) setThreadId(undefined)
  }, [isThreadRoute])

  const mappedInitial = initialMessages.map(({ id, role, content }) => ({
    id,
    role:
      role === 'tool'
        ? 'data'
        : (role as 'system' | 'user' | 'assistant' | 'data'),
    content: typeof content === 'string' ? content : JSON.stringify(content)
  }))

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

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!input.trim()) return
      setIsSubmitting(true)

      const payload = await sendMessageAction({
        threadId: threadId ?? 0,
        senderId: account.id,
        message: { role: 'user', content: input }
      })
      if (!payload.ok) return

      if (!threadId) setThreadId(payload.result!.threadId)

      handleSubmit(undefined, {
        body: { threadId: threadId ?? payload.result!.threadId }
      })
      setIsSubmitting(false)
    },
    [threadId, account.id, input, handleSubmit]
  )

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
            <Message key={m.id} message={m} />
          ))}
        </div>

        <PromptBar
          status={isSubmitting ? 'submitted' : status}
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
