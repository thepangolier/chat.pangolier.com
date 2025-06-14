'use client'
import { useChat } from '@ai-sdk/react'
import Message from '@component/chat/message'
import PromptBar from '@component/chat/prompt'

export default function AppPage() {
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
    experimental_throttle: 50
  })

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
          handleSubmit={handleSubmit}
          stop={stop}
          experimental_resume={experimental_resume}
        />
      </div>
    </div>
  )
}
