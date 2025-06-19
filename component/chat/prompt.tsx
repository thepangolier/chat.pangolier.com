'use client'
import '@scss/chat/prompt.scss'
import type { ChatRequestOptions } from 'ai'
import { useMemo } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import ModelCatalogue from '@component/chat/catalogue'
import ChatScroller from '@component/chat/scroller'
import ChatVerify from '@component/chat/verify'
import { IconSend, IconSpinner, IconStop } from '@component/shared/icon'
import { useSession } from '@context/session'

export interface PromptBarProps {
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  error: Error | undefined
  input: string
  setInput(v: string): void
  handleSubmit(
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ): void
  stop(): void
  experimental_resume(): void
}

export default function PromptBar({
  status,
  error,
  input,
  setInput,
  handleSubmit,
  stop
}: PromptBarProps) {
  const { account } = useSession()

  const icon = useMemo(() => {
    switch (status) {
      case 'streaming':
        return <IconStop />
      case 'ready':
        return <IconSend />
      default:
        return <IconSpinner />
    }
  }, [status])

  return (
    <div id="prompt">
      {account && !account.githubId && !account.googleId && <ChatVerify />}
      {status === 'error' && (
        <div className="prompt-error">
          <p>
            {error
              ? error.message
              : 'Something went wrong, please try again...'}
          </p>
        </div>
      )}
      <ChatScroller />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) {
            handleSubmit()
          }
        }}
        className={status}
      >
        <TextareaAutosize
          id="prompt-input"
          placeholder="Type your message here..."
          maxRows={20}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (input.trim()) {
                e.currentTarget.blur()
                handleSubmit()
              } else {
                setInput('')
              }
            }
          }}
        />
        <ModelCatalogue />
        <button
          type={status === 'ready' ? 'submit' : 'button'}
          className="button-send"
          onClick={() => {
            if (status === 'streaming') {
              stop()
            }
          }}
        >
          {icon}
        </button>
      </form>
    </div>
  )
}
