'use client'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { sendMessageAction } from '@action/chat/sendMessage'
import { useChat } from '@ai-sdk/react'
import Message from '@component/chat/message'
import PromptBar from '@component/chat/prompt'
import { useSession } from '@context/session'

export default function ChatInterface() {
  const { account, model, reasoning, useSearchGrounding } = useSession()
  const params = useParams<{ id?: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const [threadId, setThreadId] = useState<number | undefined>(
    params?.id ? Number(params.id) : undefined
  )

  const {
    messages,
    status,
    error,
    input,
    setInput,
    setMessages,
    handleSubmit: aiHandleSubmit,
    stop,
    experimental_resume
  } = useChat({
    api: '/api/chat',
    experimental_throttle: 50,
    body: {
      provider: model.provider,
      model: model.model,
      reasoning,
      useSearchGrounding
    }
  })

  // Reset chat when routing to new chat page
  useEffect(() => {
    if (pathname === '/chat') {
      setInput('')
      setMessages([])
      setThreadId(undefined)
    }
  }, [pathname, setInput, setMessages])

  return (
    <div id="chat">
      <div className="container chat">
        <div className="message-container">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <PromptBar
          status={status}
          error={error}
          input={input}
          setInput={setInput}
          handleSubmit={wrappedHandleSubmit}
          stop={stop}
          experimental_resume={experimental_resume}
        />
      </div>
    </div>
  )

  async function wrappedHandleSubmit(event?: { preventDefault?: () => void }) {
    if (event?.preventDefault) event.preventDefault()
    if (!input.trim()) return

    const res = await sendMessageAction({
      threadId: threadId ?? 0,
      senderId: account.id,
      message: { role: 'user', content: input }
    })

    if (res.ok && res.result) {
      if (!threadId) {
        const newId = res.result.threadId
        setThreadId(newId)
        startTransition(() => router.push(`/chat/thread/${newId}`))
      }
    }

    aiHandleSubmit()
  }
}
